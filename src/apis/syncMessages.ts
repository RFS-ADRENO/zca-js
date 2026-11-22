import { ThreadType } from "../models/index.js";
import {
    decodeConversationChunk,
    decodeMessageChunk,
    SyncConversationType,
    type SyncMessageStatus,
    type SyncProtoConversation,
    type SyncProtoMessage,
    type SyncProtoMeta,
} from "../sync/proto.js";
import {
    runSyncSession,
    SyncDeviceStatus,
    SyncTaskPriority,
    type SyncQuery,
    type SyncSessionSettings,
} from "../sync/session.js";
import { loadZProto } from "../sync/zproto.js";
import { apiFactory } from "../utils.js";

export { SyncDeviceStatus };

export type SyncProgress =
    | { type: "device_status"; status: SyncDeviceStatus }
    | { type: "conversations"; total: number }
    | { type: "messages"; conversations: number; totalConversations: number; messages: number };

export type SyncMessagesOptions = {
    /**
     * Only sync data newer than this timestamp (milliseconds).
     *
     * @default 14 days ago, at midnight
     */
    from?: number;
    /**
     * Device name shown on the phone
     *
     * @default "Chrome - Windows"
     */
    deviceName?: string;
    /**
     * Set to `false` to only get the conversation list
     *
     * @default true
     */
    messages?: boolean;
    /**
     * How long to wait for the user to confirm the sync on their phone, in milliseconds
     *
     * @default 120000
     */
    confirmTimeout?: number;
    /**
     * How long to wait for the next piece of data once the phone has started sending, in milliseconds
     *
     * @default 30000
     */
    batchTimeout?: number;
    onProgress?: (progress: SyncProgress) => unknown;
};

export type SyncedMessage = {
    /** global message id, `"0"` when the phone does not have one (use `cliMsgId` then) */
    msgId: string;
    cliMsgId: string;
    /** sender id, `null` if Zalo could not resolve it */
    uidFrom: string | null;
    ts: number;
    msgType: number;
    status: SyncMessageStatus;
    /** text of the message, or a JSON string for other message types */
    content: string;
    /** attachments, mentions (`uid` is `"-1"` for @All), quote, ... */
    meta?: SyncProtoMeta;
};

export type SyncedConversation = {
    /** user id or group id, `null` if Zalo could not resolve it */
    threadId: string | null;
    type: ThreadType;
    /** timestamp of the last message */
    lastTs: number;
    /** `"0"` when the phone does not have a global id for the last message */
    lastMsgId: string;
    lastCliMsgId: string;
    respondedByMe: boolean;
    /** id of this conversation in the sync protocol, e.g. `oneone/SI3CK9AF63A7AJAI2BO5GLABA8IAQQ80` */
    partition: string;
    messages: SyncedMessage[];
};

export type SyncMessagesResponse = {
    conversations: SyncedConversation[];
    /** pieces of data that the phone failed to send, the rest of the result is still usable */
    errors: { partition: string; code: number }[];
};

const UNLIMITED = 2147483647;
/** Zalo Web never puts more than 30 conversations in one request */
const MAX_QUERIES_PER_REQUEST = 30;
const GID_DECRYPT_CHUNK = 50;
/** `uid` of a mention that targets everyone in the group (@All) */
const MENTION_ALL_UID = "-1";

const partitionOf = (conversation: SyncProtoConversation) =>
    `${conversation.convType == SyncConversationType.Group ? "group" : "oneone"}/${conversation.convId}`;

function defaultFrom() {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - 14);
    return date.getTime();
}

export const syncMessagesFactory = apiFactory<SyncMessagesResponse>()((api, ctx) => {
    /**
     * The sync protocol uses "noised" ids, ask Zalo for the real user/group ids
     */
    async function resolveIds(noisedIds: string[]) {
        const resolved = new Map<string, string>();

        for (let i = 0; i < noisedIds.length; i += GID_DECRYPT_CHUNK) {
            const { data: ids } = await api.decryptGlobalID(noisedIds.slice(i, i + GID_DECRYPT_CHUNK));

            for (const [noisedId, id] of Object.entries(ids ?? {})) {
                if (id) resolved.set(noisedId, id);
            }
        }

        return resolved;
    }

    /**
     * Sync conversations and messages from the phone, like the "Sync messages" feature of Zalo Web.
     *
     * The phone must be online, and the user may have to confirm the request in the Zalo app.
     * The listener must be started before calling this function.
     *
     * @example
     * api.listener.start();
     * api.listener.once("cipher_key", async () => {
     *     const { conversations } = await api.syncMessages({
     *         onProgress: (progress) => console.log(progress),
     *     });
     *     for (const conversation of conversations) {
     *         console.log(conversation.threadId, conversation.messages.length);
     *     }
     * });
     *
     * @param options sync options (time range, timeouts, progress callback)
     *
     * @throws {ZaloApiError} When the listener is not started, the phone is offline, the request is not
     * confirmed or is rejected on the phone, or the sync data cannot be decrypted
     */
    return async function syncMessages(options: SyncMessagesOptions = {}): Promise<SyncMessagesResponse> {
        const from = options.from ?? defaultFrom();
        const zproto = await loadZProto(ctx);
        // one identity key for the whole sync, one ephemeral key per request (same as Zalo Web)
        const identityKey = zproto.generateKeyPair();
        let index = 0;

        const runSession = (request: Pick<SyncSessionSettings, "type" | "priority" | "queries">) =>
            runSyncSession(ctx, api.listener, zproto, identityKey, {
                ...request,
                index: index++,
                deviceName: options.deviceName ?? "Chrome - Windows",
                confirmTimeout: options.confirmTimeout ?? 120_000,
                batchTimeout: options.batchTimeout ?? 30_000,
                onDeviceStatus: (status) => options.onProgress?.({ type: "device_status", status }),
            });

        const errors: SyncMessagesResponse["errors"] = [];

        // ---- conversations ----
        const conversationResult = await runSession({
            type: "conversation",
            priority: SyncTaskPriority.High,
            queries: [{ partition: "", from, to: Number.MAX_SAFE_INTEGER, limit: UNLIMITED }],
        });
        errors.push(...conversationResult.errors);

        const protoConversations = new Map<string, SyncProtoConversation>();
        for (const chunk of conversationResult.chunks) {
            for (const conversation of decodeConversationChunk(chunk).conversations) {
                protoConversations.set(partitionOf(conversation), conversation);
            }
        }
        options.onProgress?.({ type: "conversations", total: protoConversations.size });

        // ---- messages ----
        const protoMessages = new Map<string, Map<string, SyncProtoMessage>>();
        if (options.messages !== false) {
            const queries: SyncQuery[] = [...protoConversations.entries()].map(([partition, conversation]) => ({
                partition,
                from,
                to: conversation.lastTs,
                limit: UNLIMITED,
            }));

            let messageCount = 0;
            for (let i = 0; i < queries.length; i += MAX_QUERIES_PER_REQUEST) {
                const messageResult = await runSession({
                    type: "message",
                    priority: SyncTaskPriority.Low,
                    queries: queries.slice(i, i + MAX_QUERIES_PER_REQUEST),
                });
                errors.push(...messageResult.errors);

                for (const chunk of messageResult.chunks) {
                    for (const partition of decodeMessageChunk(chunk).partitions) {
                        let messages = protoMessages.get(partition.id);
                        if (!messages) protoMessages.set(partition.id, (messages = new Map()));

                        for (const message of partition.messages) {
                            const key = message.globalId != "0" ? message.globalId : `c${message.clientId}`;
                            if (!messages.has(key)) messageCount++;
                            messages.set(key, message);
                        }
                    }
                }

                options.onProgress?.({
                    type: "messages",
                    conversations: Math.min(i + MAX_QUERIES_PER_REQUEST, queries.length),
                    totalConversations: queries.length,
                    messages: messageCount,
                });
            }
        }

        // ---- real ids ----
        const noisedIds = new Set<string>();
        for (const conversation of protoConversations.values()) noisedIds.add(conversation.convId);
        for (const messages of protoMessages.values()) {
            for (const message of messages.values()) {
                if (message.senderId) noisedIds.add(message.senderId);
                if (message.meta?.quote?.ownerId) noisedIds.add(message.meta.quote.ownerId);
                for (const mention of message.meta?.mentions ?? []) {
                    if (mention.uid != MENTION_ALL_UID) noisedIds.add(mention.uid);
                }
            }
        }
        const ids = await resolveIds([...noisedIds]);

        // ids inside `meta` are noised too, they keep their noised form when Zalo cannot resolve them
        const resolveMeta = (meta?: SyncProtoMeta): SyncProtoMeta | undefined =>
            meta && {
                ...meta,
                mentions: meta.mentions.map((mention) => ({ ...mention, uid: ids.get(mention.uid) ?? mention.uid })),
                quote: meta.quote && { ...meta.quote, ownerId: ids.get(meta.quote.ownerId) ?? meta.quote.ownerId },
            };

        const conversations: SyncedConversation[] = [...protoConversations.entries()].map(
            ([partition, conversation]) => ({
                threadId: ids.get(conversation.convId) ?? null,
                type: conversation.convType == SyncConversationType.Group ? ThreadType.Group : ThreadType.User,
                lastTs: conversation.lastTs,
                lastMsgId: conversation.lastGlobalId,
                lastCliMsgId: conversation.lastClientId,
                respondedByMe: conversation.respondedByMe,
                partition,
                messages: [...(protoMessages.get(partition)?.values() ?? [])]
                    .sort((a, b) => a.timestamp - b.timestamp)
                    .map((message) => ({
                        msgId: message.globalId,
                        cliMsgId: message.clientId,
                        uidFrom: ids.get(message.senderId) ?? null,
                        ts: message.timestamp,
                        msgType: message.msgType,
                        status: message.msgStatus,
                        content: message.content,
                        meta: resolveMeta(message.meta),
                    })),
            }),
        );
        conversations.sort((a, b) => b.lastTs - a.lastTs);

        return { conversations, errors };
    };
});
