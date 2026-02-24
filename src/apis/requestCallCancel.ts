import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { ThreadType, CallType } from "../models/index.js";
import type { RequestCallCancel } from "../models/index.js";
import { apiFactory } from "../utils.js";

export type RequestCallCancelPayload = {
    callId: number;
    callType?: boolean;
};

export type RequestCallCancelResponse = RequestCallCancel;

export const requestCallCancelFactory = apiFactory<RequestCallCancelResponse>()((api, ctx, utils) => {
    const serviceURL = {
        [ThreadType.User]: utils.makeURL(`${api.zpwServiceMap.voice_call[0]}/api/voicecall/cancel`, {
            apiType: 24,
            apiVersion: 667,
        }),
        [ThreadType.Group]: utils.makeURL(`${api.zpwServiceMap.voice_call[0]}/api/voicecall/group/cancel`, {
            apiType: 24,
            apiVersion: 667,
        }),
    };

    /**
     * Request call cancel
     *
     * @param payload request call cancel
     * @param threadId threadId
     * @param type thread type
     *
     * @throws {ZaloApiError}
     */
    return async function requestCallCancel(
        payload: RequestCallCancelPayload,
        threadId: string,
        type: ThreadType = ThreadType.User,
    ) {
        const isCallType = payload.callType ?? true;

        const params =
            type === ThreadType.User
                ? {
                      callerId: threadId,
                      callId: payload.callId,
                      callType: isCallType ? CallType.Voice : 3,
                      status: 0,
                      imei: ctx.imei,
                  }
                : {};

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(utils.makeURL(serviceURL[type], { params: encryptedParams }), {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
