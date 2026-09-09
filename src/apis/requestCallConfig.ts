import { ZaloApiError } from "../Errors/ZaloApiError.js";
import type { RequestCallConfig } from "../models/index.js";
import { apiFactory } from "../utils.js";

export type RequestCallConfigPayload = {
    callId: number;
    onCam?: boolean;
    onMic?: boolean;
};

export type RequestCallConfigResponse = RequestCallConfig;

export const requestCallConfigFactory = apiFactory<RequestCallConfigResponse>()((api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.voice_call[0]}/api/voicecall/conf`, {
        apiType: 24,
        apiVersion: 667,
    });

    /**
     * Request call config
     *
     * @param payload request call config
     * @param threadId threadId
     *
     * @throws {ZaloApiError}
     */
    return async function requestCallConfig(payload: RequestCallConfigPayload, threadId: string) {
        const isOnCam = payload.onCam ?? false;
        // const isOnMic = payload.onMic ?? true;

        const params = {
            calleeId: threadId,
            callId: payload.callId,
            isOnCam: isOnCam ? 1 : 0,
            isOnMic: -1,
            data: "", // @TODO: idk data
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
