import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { ThreadType, CallType } from "../models/index.js";
import { apiFactory } from "../utils.js";

export type RequestCallLogEndPayload = {
    callId: number;
    callType?: boolean;
};

export type RequestCallLogEndResponse = "";

export const requestCallLogEndFactory = apiFactory<RequestCallLogEndResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.voice_call[0]}/api/voicecall/logendcall`, {
        apiType: 24,
        apiVersion: 667,
    });

    /**
     * Request call log end
     *
     * @param payload request call
     * @param threadId threadId
     * @param type thread type
     *
     * @throws {ZaloApiError}
     */
    return async function requestCallLogEnd(
        payload: RequestCallLogEndPayload,
        threadId: string,
        type: ThreadType = ThreadType.User,
    ) {
        const requestCall = await api.requestCall({ callId: payload.callId }, threadId, type);
        const isCallType = payload.callType ?? true;

        const params = {
            call_id: requestCall.id,
            partner_id: threadId,
            status: 104,
            logdata: {
                rtpAddr: "171.244.25.118:4200",
                rtpAddrIPv6: "2401:5f80:4001:e::10:4200",
                Session:
                    "0m_KBCMOmtWADiqGyfh0VWOmkYQQbzih8Z2h3eN4q1Kl7gKTrB2XTYGOfXZRjg10C3EL6jsYhqPeClyEQadIEV-5f9tG9_IY7Rd2tefdege8tyRJbnIghW-isTBL5jgw7j6ywAbFxuTUMIP66j0WofJYSG",
                //   "EchoData": [
                //     {
                //       "server": "171.244.25.118:4200",
                //       "numRecv": 14,
                //       "rttAvg": 15,
                //       "rating": 14.2252
                //     },
                //     {
                //       "server": "171.244.128.60:4200",
                //       "numRecv": 0,
                //       "rttAvg": 0,
                //       "rating": 0.0006
                //     },
                //     {
                //       "server": "42.119.138.77:4200",
                //       "numRecv": 13,
                //       "rttAvg": 15,
                //       "rating": 4.1008
                //     },
                //     {
                //       "server": "58.187.8.110:4200",
                //       "numRecv": 0,
                //       "rttAvg": 0,
                //       "rating": 0.0004
                //     },
                //     {
                //       "server": "222.255.238.71:4200",
                //       "numRecv": 12,
                //       "rttAvg": 16,
                //       "rating": 3.9747
                //     },
                //     {
                //       "server": "14.238.143.134:4200",
                //       "numRecv": 0,
                //       "rttAvg": 0,
                //       "rating": 0.0002
                //     },
                //     {
                //       "server": "49.213.114.37:4200",
                //       "numRecv": 12,
                //       "rttAvg": 15,
                //       "rating": 3.9761
                //     }
                //   ],
                recv415: 0,
                recv407: 0,
                recv403: 0,
                timeout: 0,
                cacheServerType: 0,
                sendDataRinging: 0,
                CallType: isCallType ? CallType.Voice : 3,
                CallToken: 1370004451,
                InitZrtpDuration: 8,
                fromNoti: 0,
                localNwProtocol: 0,
                partnerNwProtocol: 0,
                nwPipeStatus: 2,
                devcInfo:
                    "{audIn:[{Headset (Fenda W5 Hands-Free AG Audio),0},{Microphone (2- High Definition Audio Device),1}],audOut:[{Headset (Fenda W5 Hands-Free AG Audio),0},{Headphones (Fenda W5 Stereo),1},{Speakers (2- High Definition Audio Device),2}],vid:[{HP HD Webcam [Fixed],0}]}",
                sysInfo: "Windows_NT_10.0.19045_win32_ia32;Intel(R) Core(TM) i5-3427U CPU @ 1.80GHz;2295",
                CurState: 3,
            },
            duration: 0,
            role: true,
            imei: ctx.imei,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
