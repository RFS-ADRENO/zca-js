import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type BroadCastCallForGroupResponse = {
    // da xoa \" escape vi bi loi json
    data: {
        callId: 176598562;
        partnerInfo: [
            {
                audioState: 0;
                videoState: 1;
                callState: 3;
                timeJoinCall: 1769703132654;
                lastActivate: 1769703132745;
                userId: 424375248;
            },
        ];
        hostCall: 284398598;
        message: "successfully";
        error: 0;
        userId: 424375248;
    };
    message: null;
};

export const broadCastCallForGroupFactory = apiFactory<BroadCastCallForGroupResponse>()((api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.voice_call[0]}/api/voicecall/group/broadcast`, {
        apiType: 24,
        apiVersion: 667,
    });

    /**
     * BroadCast voice call for only group
     *
     * @throws {ZaloApiError}
     */
    return async function broadCastCallForGroup() {
        // const randomCallId = Math.floor(Date.now() / 1000);
        // const requestCall = await api.requestCall({ callId: randomCallId }, threadId, ThreadType.Group);

        const params = {
            callId: 176598562,
            hostCall: 284398598,
            userId: 424375248, // idk userID
            callstate: 3,
            audiostate: 0,
            videostate: 1,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(serviceURL, {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
