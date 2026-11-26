import type { Listener, SyncControlEvent } from "../apis/listen.js";
import type { ContextSession } from "../context.js";
import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { encodeBase64, randomAlphanumeric, request } from "../utils.js";
import type { ZProto, ZProtoKeyPair } from "./zproto.js";
import { zstdDecompress } from "./zstd.js";

/** Status of the device that answers the sync request (the phone) */
export enum SyncDeviceStatus {
    Active = 1,
    Idle = 2,
    /** The phone is showing a confirmation prompt to the user */
    WaitingConfirm = 3,
    Confirmed = 4,
    BypassConfirmed = 5,
    UserReject = 6,
    UserCancel = 7,
    Busy = 8,
    LowStorage = 9,
    Logout = 10,
}

export enum SyncTaskPriority {
    High = 0,
    Low = 2,
}

export type SyncRequestType = "conversation" | "message";

export type SyncQuery = {
    partition: string;
    from: number;
    to: number;
    limit: number;
};

/** A piece of data that the phone failed to send */
export type SyncSessionError = { partition: string; code: number };

export type SyncSessionSettings = {
    type: SyncRequestType;
    priority: SyncTaskPriority;
    queries: SyncQuery[];
    /** position of this request in the whole sync, starting from 0 */
    index: number;
    deviceName: string;
    confirmTimeout: number;
    batchTimeout: number;
    onDeviceStatus?: (status: SyncDeviceStatus) => unknown;
};

export type SyncSessionResult = {
    /** decrypted and decompressed (but not yet parsed) chunks */
    chunks: Uint8Array[];
    errors: SyncSessionError[];
};

type SyncScope = {
    partition: string;
    from?: number;
    to?: number;
};

type SyncBatch = {
    syncId: string;
    idx: number;
    isLast: boolean;
    err: number;
    msgUrl?: string;
    batchType: BatchType;
    scopes: SyncScope[];
};

enum BatchType {
    Message = 1,
    /** carries the session keys needed to decrypt the `Message` batches of the same request */
    MetadataEmbedded = 2,
}

enum SyncType {
    Full = 0,
}

enum TargetDevice {
    Mobile = 0,
}

enum DisposeReason {
    UserCancel = 0,
    Success = 1,
    Error = 2,
}

const CMD_REQUEST_SYNC = 590;
const CMD_DISPOSE_SESSION = 591;
const CMD_WAKE_UP = 592;

const BATCH_SIZE = 2000;

const DEVICE_ERRORS: Partial<Record<SyncDeviceStatus, string>> = {
    [SyncDeviceStatus.UserReject]: "The sync request was rejected on the phone",
    [SyncDeviceStatus.UserCancel]: "The sync was cancelled on the phone",
    [SyncDeviceStatus.Busy]: "The phone is busy syncing with another device",
    [SyncDeviceStatus.LowStorage]: "The phone does not have enough storage to sync",
    [SyncDeviceStatus.Logout]: "The phone is logged out",
};

/** A sync file is a list of `[uint32 little endian length][encrypted chunk]` */
function splitChunks(file: Uint8Array) {
    const view = new DataView(file.buffer, file.byteOffset, file.byteLength);
    const chunks: Uint8Array[] = [];

    let offset = 0;
    while (offset + 4 <= file.byteLength) {
        const length = view.getUint32(offset, true);
        offset += 4;
        if (offset + length > file.byteLength) throw new ZaloApiError("Malformed sync data: truncated chunk");
        chunks.push(file.subarray(offset, offset + length));
        offset += length;
    }

    return chunks;
}

async function download(ctx: ContextSession, url: string) {
    const response = await request(ctx, url, { method: "GET" }, true);
    if (!response.ok) throw new ZaloApiError(`Failed to download sync data: ${response.status}`);
    return new Uint8Array(await response.arrayBuffer());
}

/**
 * One request to the phone: send it, collect every batch it uploads, then decrypt them.
 *
 * @param ctx session context, used to download the uploaded batches
 * @param listener a started listener, the request and its events go through the websocket
 * @param zproto Zalo's crypto module
 * @param identityKey key pair shared by every request of the same sync
 * @param settings what to ask for, and how long to wait
 *
 * @throws {ZaloApiError} When the request is refused, rejected on the phone, times out or cannot be decrypted
 */
export async function runSyncSession(
    ctx: ContextSession,
    listener: Listener,
    zproto: ZProto,
    identityKey: ZProtoKeyPair,
    settings: SyncSessionSettings,
): Promise<SyncSessionResult> {
    const syncId = randomAlphanumeric(32);
    const ephemeralKey = zproto.generateKeyPair();

    const batches = new Map<number, SyncBatch>();
    let totalBatches = -1;

    let settle: { resolve: () => void; reject: (error: Error) => void };
    const finished = new Promise<void>((resolve, reject) => (settle = { resolve, reject }));
    finished.catch(() => {}); // rejections are handled by the `await` below

    let timer: ReturnType<typeof setTimeout> | undefined;
    const arm = (ms: number, message: string) => {
        clearTimeout(timer);
        timer = setTimeout(() => settle.reject(new ZaloApiError(message)), ms);
    };

    let wakeUpSent = false;
    const onEvent = (event: SyncControlEvent) => {
        const data = event.data as Record<string, unknown>;
        if (data.syncId != syncId) return;

        if (event.act == "transfer_status") {
            const status = Number(data.status) as SyncDeviceStatus;
            settings.onDeviceStatus?.(status);

            const deviceError = DEVICE_ERRORS[status];
            if (deviceError) return settle.reject(new ZaloApiError(deviceError, status));

            if (status == SyncDeviceStatus.WaitingConfirm) {
                arm(settings.confirmTimeout, "The sync request was not confirmed on the phone in time");
            } else if (status == SyncDeviceStatus.Idle) {
                // the app is in background, ask Zalo to wake it up
                arm(settings.confirmTimeout, "The phone did not come back online in time");
                if (!wakeUpSent) {
                    wakeUpSent = true;
                    listener
                        .sendRequest(CMD_WAKE_UP, 0, { syncId, toDevice: TargetDevice.Mobile }, 3000)
                        .catch(() => {});
                }
            } else {
                arm(settings.batchTimeout, "The phone stopped sending sync data");
            }
            return;
        }

        if (event.act != "upload_batch" && event.act != "transfer_error") return;

        const batch = data as unknown as SyncBatch & { errorCode?: number };
        if (typeof batch.idx != "number") return;
        if (event.act == "transfer_error") batch.err = Number(batch.errorCode ?? batch.err ?? -1);

        batches.set(batch.idx, batch);
        if (batch.isLast) totalBatches = batch.idx + 1;

        if (batches.size == totalBatches) settle.resolve();
        else arm(settings.batchTimeout, "The phone stopped sending sync data");
    };

    listener.on("sync_event", onEvent);
    let reason = DisposeReason.Error;

    try {
        const ack = await listener.sendRequest<{ err?: number }>(CMD_REQUEST_SYNC, 0, {
            syncId,
            syncType: SyncType.Full,
            ek: encodeBase64(ephemeralKey.publicKey),
            ik: encodeBase64(identityKey.publicKey),
            toDevice: TargetDevice.Mobile,
            tempKey: "",
            deviceName: settings.deviceName,
            req: {
                type: settings.type,
                priority: settings.priority,
                queries: settings.queries,
                batchSize: BATCH_SIZE,
            },
            ver: 1,
            ussidx: settings.index,
        });

        const ackCode = ack.code || Number(ack.data?.err ?? 0);
        if (ackCode != 0) throw new ZaloApiError(`Zalo refused the sync request: ${ack.message || ackCode}`, ackCode);

        // the phone answers with its status first; if it stays silent it is most likely offline
        arm(settings.confirmTimeout, "The phone did not answer the sync request, make sure it is online");
        await finished;
        reason = DisposeReason.Success;
    } finally {
        clearTimeout(timer);
        listener.off("sync_event", onEvent);
        // always release the session on the phone, the result of this request does not matter
        listener
            .sendRequest(CMD_DISPOSE_SESSION, 0, { syncId, toDevice: TargetDevice.Mobile, reason }, 3000)
            .catch(() => {});
    }

    const ordered = [...batches.values()].sort((a, b) => a.idx - b.idx);
    const errors: SyncSessionError[] = [];
    const usable = ordered.filter((batch) => {
        if (batch.err == 0 && batch.msgUrl) return true;
        for (const scope of batch.scopes ?? []) errors.push({ partition: scope.partition, code: batch.err });
        return false;
    });

    const files = await Promise.all(usable.map((batch) => download(ctx, batch.msgUrl!)));
    const plaintexts: Uint8Array[] = [];

    // metadata batches first, they establish the session used by the others
    let sessionRecord: Uint8Array | null = null;
    usable.forEach((batch, i) => {
        if (batch.batchType != BatchType.MetadataEmbedded) return;
        for (const chunk of splitChunks(files[i])) {
            const decrypted = zproto.decryptMetadata(chunk, identityKey, ephemeralKey.privateKey);
            sessionRecord = decrypted.sessionRecord;
            if (decrypted.plaintext.length > 0) plaintexts.push(decrypted.plaintext);
        }
    });

    usable.forEach((batch, i) => {
        if (batch.batchType == BatchType.MetadataEmbedded) return;
        if (!sessionRecord) throw new ZaloApiError("The phone did not send the keys to decrypt the sync data");
        for (const chunk of splitChunks(files[i])) {
            plaintexts.push(zproto.decryptMessage(chunk, sessionRecord).plaintext);
        }
    });

    const chunks = await Promise.all(plaintexts.map((plaintext) => zstdDecompress(plaintext)));
    return { chunks, errors };
}
