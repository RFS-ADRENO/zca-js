import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { ThreadType } from "../models/index.js";
import { apiFactory } from "../utils.js";

export type SendVoiceOptions = {
    voiceUrl: string;
    /**
     * Time to live in milliseconds (default: 0)
     */
    ttl?: number;
};

export type SendVoiceResponse = {
    msgId: string;
};

export const sendVoiceFactory = apiFactory<SendVoiceResponse>()((api, ctx, utils) => {
    const serviceURL = {
        [ThreadType.User]: utils.makeURL(`${api.zpwServiceMap.file[0]}/api/message/forward`),
        [ThreadType.Group]: utils.makeURL(`${api.zpwServiceMap.file[0]}/api/group/forward`),
    };

    /**
     * Send a voice to a User - Group
     *
     * @param options voice options
     * @param threadId ID of the user or group to send the voice to
     * @param type Type of thread, default user
     *
     * @throws ZaloApiError
     */
    return async function sendVoice(options: SendVoiceOptions, threadId: string, type: ThreadType = ThreadType.User) {
        let fileSize = null;
        const clientId = Date.now().toString();

        try {
            const headResponse = await utils.request(options.voiceUrl, { method: "HEAD" }, true);
            if (headResponse.ok) {
                fileSize = parseInt(headResponse.headers.get("content-length") || "0");
            }
        } catch (error: unknown) {
            throw new ZaloApiError(
                `Unable to get voice content: ${error instanceof Error ? error.message : String(error)}`,
            );
        }

        const params =
            type === ThreadType.User
                ? {
                      toId: threadId,
                      ttl: options.ttl ?? 0,
                      zsource: -1,
                      msgType: 3,
                      clientId: clientId,
                      msgInfo: JSON.stringify({
                          voiceUrl: options.voiceUrl,
                          m4aUrl: options.voiceUrl,
                          fileSize: fileSize ?? 0,
                      }),
                      imei: ctx.imei,
                  }
                : {
                      grid: threadId,
                      visibility: 0,
                      ttl: options.ttl ?? 0,
                      zsource: -1,
                      msgType: 3,
                      clientId: clientId,
                      msgInfo: JSON.stringify({
                          voiceUrl: options.voiceUrl,
                          m4aUrl: options.voiceUrl,
                          fileSize: fileSize ?? 0,
                      }),
                      imei: ctx.imei,
                  };

        if (type !== ThreadType.User && type !== ThreadType.Group) {
            throw new ZaloApiError("Thread type is invalid");
        }

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(serviceURL[type], {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });

        return utils.resolve(response);
    };
});
