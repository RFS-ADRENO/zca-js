import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { ThreadType } from "../models/index.js";
import { apiFactory } from "../utils.js";

export type RingringCallResponse = {
    // user
    calleeId: 424375248;
    callerId: 284398598;

    // group
    // da xoa \" escape vi bi loi json
    params: {
        callId: 176598562;
        hostCall: 284398598;
        userId: 424375248;
        status: 0;
    };
};

export const ringringCallFactory = apiFactory<RingringCallResponse>()((api, ctx, utils) => {
    const serviceURL = {
        [ThreadType.User]: utils.makeURL(`${api.zpwServiceMap.voice_call[0]}/api/voicecall/ringring`, {
            apiType: 24,
            apiVersion: 667,
        }),
        [ThreadType.Group]: utils.makeURL(`${api.zpwServiceMap.voice_call[0]}/api/voicecall/group/ringring`, {
            apiType: 24,
            apiVersion: 667,
        }),
    };

    /**
     * Ringring voice call
     *
     * @param payload ringring call
     * @param threadId threadId
     * @param type thread type
     *
     * @throws {ZaloApiError}
     */
    return async function ringringCall(threadId: string, type: ThreadType = ThreadType.User) {
        // const randomCallId = Math.floor(Date.now() / 1000);
        // const requestCall = await api.requestCall({ callId: randomCallId }, threadId, type);

        const params =
            type === ThreadType.User
                ? {
                      callerId: "6643668986844401906", // userID
                      callId: 174170544,
                      status: 0,
                      imei: ctx.imei,
                  }
                : {
                      callId: 176598562,
                      hostCall: 284398598,
                      data: {
                          callType: 1,
                          extraData: "",
                          status: 1,
                      },
                  };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(serviceURL[type], {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
