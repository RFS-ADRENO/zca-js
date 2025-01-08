import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { MessageType } from "../models/Message.js";
import { apiFactory } from "../utils.js";

export type SendVoiceOptions = {
    voiceUrl: string;
    /**
     * Time to live in miliseconds (default: 0)
     */
    ttl?: number;
};

export type SendVoiceResponse = {
    msgId: string;
};

export const sendVoiceFactory = apiFactory<SendVoiceResponse>()((api, ctx, utils) => {
    const directMessageServiceURL = utils.makeURL(`${api.zpwServiceMap.file[0]}/api/message/forward`);
    const groupMessageServiceURL = utils.makeURL(`${api.zpwServiceMap.file[0]}/api/group/forward`);

    /**
     * Send a voice to a User - Group
     *
     * @param options voice options
     * @param threadId ID of the user or group to send the voice to
     * @param threadType Type of thread, default user
     *
     * @throws ZaloApiError
     */
    return async function sendVoice(
        options: SendVoiceOptions,
        threadId: string,
        threadType: MessageType = MessageType.DirectMessage,
    ) {
        let fileSize = null;
        let clientId = Date.now().toString();

        try {
            const headResponse = await utils.request(options.voiceUrl, { method: "HEAD" }, true);
            if (headResponse.ok) {
                fileSize = parseInt(headResponse.headers.get("content-length") || "0");
            }
        } catch (error: any) {
            throw new ZaloApiError(`Unable to get voice content: ${error?.message || error}`); 
        }

        const params: any = {
            ttl: options.ttl ?? 0,
            zsource: -1,
            msgType: 3,
            clientId: clientId,
            msgInfo: JSON.stringify({
                voiceUrl: options.voiceUrl,
                m4aUrl: options.voiceUrl,
                fileSize: fileSize ?? 0,
            }),
        };

        let serviceURL;
        if (threadType === 0) {
            serviceURL = directMessageServiceURL;
            params.toId = threadId;
            params.imei = ctx.imei;
        } else if (threadType === 1) {
            serviceURL = groupMessageServiceURL;
            params.visibility = 0;
            params.grid = threadId;
            params.imei = ctx.imei;
        } else {
            throw new ZaloApiError("Thread type is invalid");
        }

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(serviceURL, {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });

        return utils.resolve(response);
    };
});
