import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory, encodeAES, makeURL, request } from "../utils.js";

export type SendVoiceResponse = {
    msgId: string;
};

export const sendVoiceFactory = apiFactory<SendVoiceResponse>()((api, ctx, resolve) => {
    const directMessageServiceURL = makeURL(`${api.zpwServiceMap.file[0]}/api/message/forward`);
    const groupMessageServiceURL = makeURL(`${api.zpwServiceMap.file[0]}/api/group/forward`);

    /**
     * Send a voice to a User - Group
     *
     * @param voiceUrl URL of the voice
     * @param threadId ID of the user or group to send the voice to
     * @param threadType Type of thread (USER or GROUP) || 1 of USER - 2 of GROUPGROUP
     * @param ttl Time to live for the message
     *
     * @throws ZaloApiError
     */
    return async function sendVoice(voiceUrl: string, threadId: string, threadType: number, ttl: number = 0) {
        // fileSize Size of voice - fileSize: number | null = null,
        let fileSize = null;
        let clientId = Date.now();

        try {
            const headResponse = await request(voiceUrl, { method: "HEAD" });
            if (headResponse.ok) {
                fileSize = parseInt(headResponse.headers.get("content-length") || "0");
            }
        } catch (error: any) {
            throw new ZaloApiError(`Unable to get voice content: ${error.message}`);
        }

        const params: any = {
            ttl: ttl,
            zsource: -1,
            msgType: 3,
            clientId: String(clientId),
            msgInfo: JSON.stringify({
                voiceUrl: voiceUrl,
                m4aUrl: voiceUrl,
                fileSize: Number(fileSize),
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

        const encryptedParams = encodeAES(ctx.secretKey, JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await request(serviceURL, {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });

        return resolve(response);
    };
});
