import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { ThreadType } from "../models/index.js";
import { apiFactory } from "../utils.js";

export type AnswerCallResponse = {
    // response user | 1 - 1
    calleeId: number;
    callerId: number;
    // "calleeId":424375248,
    // "callerId":284398598

    // response group
    // da xoa \" escape vi bi loi json
    "params": {
    "callId": 170439571,
    "partnerInfo": [
      {
        "audioState": 0,
        "videoState": 0,
        "callState": 3,
        "timeJoinCall": 1769696973545,
        "lastActivate": 1769696973545,
        "userId": 424375248
      },
      {
        "audioState": 0,
        "videoState": 0,
        "callState": 3,
        "timeJoinCall": 1769696965811,
        "lastActivate": 1769696965859,
        "userId": 284398598
      }
    ],
    "members": [
      284398598,
      424375248
    ],
    "audiostate": 0,
    "videostate": 0,
    "errorCode": 0,
    "id": 170439571,
    "hostCall": 284398598,
    "userId": 424375248,
    "status": 0,
    "ts": 1769696973545
  },
  "status": 0
};

export const answerCallFactory = apiFactory<AnswerCallResponse>()((api, ctx, utils) => {
    const serviceURL = {
        [ThreadType.User]: utils.makeURL(`${api.zpwServiceMap.voice_call[0]}/api/voicecall/answer`, {
            apiType: 24,
            apiVersion: 667,
        }),
        [ThreadType.Group]: utils.makeURL(`${api.zpwServiceMap.voice_call[0]}/api/voicecall/group/answer`, {
            apiType: 24,
            apiVersion: 667,
        }),
    };

    /**
     * Answer voice call
     *
     * @param payload answer call
     * @param threadId threadId
     * @param type thread type
     *
     * @throws {ZaloApiError}
     */
    return async function answerCall(threadId: string, type: ThreadType = ThreadType.User) {
        // const randomCallId = Math.floor(Date.now() / 1000);
        // const requestCall = await api.requestCall({ callId: randomCallId }, threadId, type);

        const params =
            type === ThreadType.User
                ? {
                        "callerId": "6643668986844401906",
                        "callId": 169622236,
                        "status": 0,
                        "codec": [
                          {
                            "dynamicFptime": 0,
                            "frmPtime": 20,
                            "name": "opus/16000/1",
                            "payload": 112
                          }
                        ],
                        "rtcpAddress": "171.244.25.119:4200",
                        "rtpAddress": "171.244.25.119:4200",
                        "session_id": "3ZeC99cmf4070nKOhhAdHWi5OYx6lxmJBmLp1jdijoqY9NqLY9_KUHajQ2QxdDLE0GHV9Bs8saXP1JNLwFEcqYmYR_T-3PhuueuJj2HDpF3tw1UvEJx4zF2R2BXxFBJWuUPjWWTbWTrUMION1syGbho5IG",
                        "extendData": {
                          "callType": 0,
                          "fecTP": 0,
                          "gccAudio": 1,
                          "gccEarlyCall": 0,
                          "gccMode": 1,
                          "gccSVLR": 1,
                          "maxFT": 60,
                          "newZrtc": 1,
                          "numServers": 0,
                          "p2p": [
                            {
                              "ip": "192.168.1.202",
                              "port": 50571,
                              "type": 0
                            },
                            {
                              "ip": "14.161.18.204",
                              "port": 50571,
                              "type": 1
                            }
                          ],
                          "packetMode": 2,
                          "platform": 2,
                          "sP2P": 1,
                          "select2side": 1,
                          "serverAddr": [
                            {
                              "rtcp": "171.244.25.119:4200",
                              "rtcpIPv6": "2401:5f80:4001:e::11:4200",
                              "rtp": "171.244.25.119:4200",
                              "rtpIPv6": "2401:5f80:4001:e::11:4200",
                              "tpType": 0
                            }
                          ],
                          "spTcp": 1,
                          "srtcp": 0,
                          "srtpMode": 1,
                          "supportCallBusy": 0,
                          "supportHevcDecode": 1,
                          "tpType": 0,
                          "video": {
                            "codec": [
                              {
                                "name": "h264",
                                "payload": 97
                              }
                            ]
                          }
                        },
                        "subCommand": 3
                      }                      
                : {
                        "callId": 170439571,
                        "hostCall": 284398598,
                        "data": {
                        "callType": 1,
                        "codec": "",
                        "extendData": "",
                        "groupId": 509603086, // idk
                        "status": 0
                        }
                        // "data": "\\n{\\n\\t\"callType\" : 1,\\n\\t\"codec\" : \"\",\\n\\t\"extendData\" : \"\",\\n\\t\"groupId\" : 509603086,\\n\\t\"status\" : 0\\n}\\n" 
                  };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(serviceURL[type], {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
