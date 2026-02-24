import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type PingCallForGroupResponse = {
    // da xoa \" escape vi bi loi json
    data: {
        callId: 170439571;
        partnerInfo: [
            {
                audioState: 0;
                videoState: 1;
                callState: 3;
                timeJoinCall: 1769696973545;
                lastActivate: 1769696974983;
                userId: 424375248;
            },
            {
                audioState: 0;
                videoState: 0;
                callState: 3;
                timeJoinCall: 1769696965811;
                lastActivate: 1769696974860;
                userId: 284398598;
            },
        ];
        data: "";
        num_members: 2;
        hostCall: 284398598;
        message: "successfully";
        error: 0;
        userId: 424375248;
        ts: 1769696974983;
    };
    message: null;
};

export const pingCallForGroupFactory = apiFactory<PingCallForGroupResponse>()((api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.voice_call[0]}/api/voicecall/group/ping`, {
        apiType: 24,
        apiVersion: 667,
    });

    /**
     * Ping voice call for only group
     *
     * @throws {ZaloApiError}
     */
    return async function pingCallForGroup() {
        // const randomCallId = Math.floor(Date.now() / 1000);
        // const requestCall = await api.requestCall({ callId: randomCallId }, threadId, ThreadType.Group);

        const params = {
            callId: 170439571,
            hostCall: 284398598,
            userId: 424375248, // idk userID
            callstate: 3,
            /* not using camera */
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
