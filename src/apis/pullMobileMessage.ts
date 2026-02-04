import crypto from "node:crypto";
import os from "node:os";
import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type PullMobileMessageResponse = {
    status?: number;
    _privateKey?: string;
    [key: string]: unknown;
};

// Generate RSA key pair for Noise Protocol handshake
function generateRSAKeyPair() {
    const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
        modulusLength: 2048,
        publicKeyEncoding: {
            type: "spki",
            format: "der",
        },
        privateKeyEncoding: {
            type: "pkcs8",
            format: "pem",
        },
    });

    return {
        publicKey: publicKey.toString("base64"),
        privateKey: privateKey,
    };
}

export const pullMobileMessageFactory = apiFactory<PullMobileMessageResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.file[0]}/api/message/pull_mobile_msg`);

    /**
     * Request mobile device to sync messages to desktop/web
     * This API triggers a notification on the mobile device asking user to confirm sync
     *
     * @param options - Configuration options for the sync request
     * @param options.fromSeqId - Timestamp to sync messages from (in milliseconds). Use 0 for all messages.
     * @param options.minSeqId - Optional minimum sequence ID (default: 0)
     * @param options.isRetry - Whether this is a retry request (default: 0)
     * @param options.pcName - Display name shown on mobile notification (default: hostname)
     *
     * @example
     * // Sync last 3 days with custom name:
     * const startDate = new Date();
     * startDate.setDate(startDate.getDate() - 3);
     * startDate.setHours(0, 0, 0, 0);
     * pullMobileMessage({ fromSeqId: startDate.getTime(), pcName: "My Zalo" });
     *
     * @note After calling this API, user needs to confirm sync on their mobile device
     * @note Then receive sync data via WebSocket events
     *
     * @throws {ZaloApiError}
     */
    return async function pullMobileMessage(
        options?: {
            fromSeqId?: number;
            minSeqId?: number;
            isRetry?: number;
            pcName?: string;
        }
    ) {
        const { fromSeqId, minSeqId, isRetry = 0, pcName } = options ?? {};
        const keyPair = generateRSAKeyPair();

        const params = {
            pc_name: pcName ?? os.hostname(),
            public_key: keyPair.publicKey,
            from_seq_id: fromSeqId ?? 0,
            is_retry: isRetry,
            min_seq_id: minSeqId ?? 0,
            temp_key: "",
            imei: ctx.imei,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const finalURL = utils.makeURL(serviceURL, {
            params: encryptedParams,
            nretry: 0,
        });

        const response = await utils.request(finalURL, {
            method: "GET",
        });

        const result = await utils.resolve(response);

        return {
            ...result,
            _privateKey: keyPair.privateKey,
        };
    };
});
