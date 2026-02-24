import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { ThreadType } from "../models/index.js";
import { apiFactory } from "../utils.js";

export type RequestVoiceCallResponse = {
    msg: string;
    calleeId: number;
    callerId: number;
    status: number;
};

export const requestVoiceCallFactory = apiFactory<RequestVoiceCallResponse>()((api, ctx, utils) => {
    const serviceURL = {
        [ThreadType.User]: utils.makeURL(`${api.zpwServiceMap.voice_call[0]}/api/voicecall/request`, {
            apiType: 24,
            apiVersion: 667,
        }),
        [ThreadType.Group]: utils.makeURL(`${api.zpwServiceMap.voice_call[0]}/api/voicecall/group/request`, {
            apiType: 24,
            apiVersion: 667,
        }),
    };

    /**
     * Request voice call
     *
     * @param payload request call
     * @param threadId threadId
     * @param type thread type
     *
     * @throws {ZaloApiError}
     */
    return async function requestVoiceCall(threadId: string, type: ThreadType = ThreadType.User) {
        const randomCallId = Math.floor(Date.now() / 1000);
        const requestCall = await api.requestCall({ callId: randomCallId }, threadId, type);

        const params =
            type === ThreadType.User
                ? {
                      calleeId: threadId,
                      rtcpAddress: requestCall.rtpIP,
                      rtpAddress: requestCall.rtpIP,
                      codec: JSON.stringify([
                          {
                              dynamicFptime: requestCall.settings.dynamicFptime,
                              frmPtime: 20,
                              name: "opus/16000/1",
                              payload: 112,
                          },
                      ]),
                      session: requestCall.sessId,
                      callId: requestCall.id,
                      imei: ctx.imei,
                      //   extendData: JSON.stringify({
                      //       callType: 0,
                      //       fecTP: 0,
                      //       gccAudio: requestCall.data.zrtc_config.gccAudio ? 1 : 0,
                      //       gccEarlyCall: requestCall.data.zrtc_config.gccEarlyCall ? 1 : 0,
                      //       gccMode: requestCall.data.zrtc_config.gccMode,
                      //       gccSVLR: requestCall.data.zrtc_config.gccSuspendVideoLowBitrate ? 1 : 0,
                      //       maxFT: 60,
                      //       newZrtc: 1,
                      //       numServers: 0,
                      //       p2p: [
                      //           { ip: "2402:800:6311:f8c6:1e6b:930c:424a:70a7", port: 63927, type: 0 },
                      //           { ip: "2402:800:6311:f8c6:1139:2c9c:49b5:5ddc", port: 63927, type: 0 },
                      //           { ip: "192.168.1.12", port: 63927, type: 0 },
                      //           { ip: "171.250.164.91", port: 24218, type: 1 },
                      //       ],
                      //       packetMode: 2,
                      //       platform: 2,
                      //       sP2P: requestCall.data.settings.p2p,
                      //       serverAddr: [
                      //           {
                      //               rtcp: "171.244.25.119:4200",
                      //               rtcpIPv6: "2401:5f80:4001:e::11:4200",
                      //               rtp: "171.244.25.119:4200",
                      //               rtpIPv6: "2401:5f80:4001:e::11:4200",
                      //               tpType: 0,
                      //           },
                      //       ],
                      //       serverResult: [
                      //           {
                      //               recv: 14,
                      //               rtcp: "171.244.25.119:4200",
                      //               rtcpIPv6: "2401:5f80:4001:e::11:4200",
                      //               rtp: "171.244.25.119:4200",
                      //               rtpIPv6: "2401:5f80:4001:e::11:4200",
                      //               rtt: 264,
                      //               spTcp: 1,
                      //               tpType: 0,
                      //           },
                      //           {
                      //               recv: 12,
                      //               rtcp: "222.255.238.71:4200",
                      //               rtcpIPv6: "2001:ee0:37f:fff3::10:4200",
                      //               rtp: "222.255.238.71:4200",
                      //               rtpIPv6: "2001:ee0:37f:fff3::10:4200",
                      //               rtt: 215,
                      //               spTcp: 1,
                      //               tpType: 0,
                      //           },
                      //           {
                      //               recv: 12,
                      //               rtcp: "49.213.114.37:4200",
                      //               rtcpIPv6: "2001:df0:13:7::1f:4200",
                      //               rtp: "49.213.114.37:4200",
                      //               rtpIPv6: "2001:df0:13:7::1f:4200",
                      //               rtt: 211,
                      //               spTcp: 1,
                      //               tpType: 0,
                      //           },
                      //           {
                      //               recv: 12,
                      //               rtcp: "42.119.138.77:4200",
                      //               rtcpIPv6: "2405:4800:ae00:1b01::231:4200",
                      //               rtp: "42.119.138.77:4200",
                      //               rtpIPv6: "2405:4800:ae00:1b01::231:4200",
                      //               rtt: 220,
                      //               spTcp: 1,
                      //               tpType: 0,
                      //           },
                      //           {
                      //               recv: 1,
                      //               rtcp: "58.187.8.114:4200",
                      //               rtcpIPv6: "2405:4800:200:e0::14:4200",
                      //               rtp: "58.187.8.114:4200",
                      //               rtpIPv6: "2405:4800:200:e0::14:4200",
                      //               rtt: 31,
                      //               spTcp: 1,
                      //               tpType: 0,
                      //           },
                      //           {
                      //               recv: 1,
                      //               rtcp: "171.244.128.54:4200",
                      //               rtcpIPv6: "2401:5f80:3fff:7::e:4200",
                      //               rtp: "171.244.128.54:4200",
                      //               rtpIPv6: "2401:5f80:3fff:7::e:4200",
                      //               rtt: 34,
                      //               spTcp: 1,
                      //               tpType: 0,
                      //           },
                      //       ],
                      //       spTcp: 1,
                      //       srtcp: 0,
                      //       srtpMode: 1,
                      //       supportCallBusy: requestCall.settings.supportCallBusy,
                      //       supportHevcDecode: 1,
                      //       tpType: 0,
                      //       video: JSON.stringify({
                      //           codec: [
                      //               {
                      //                   name: "h264",
                      //                   payload: 97,
                      //               },
                      //           ],
                      //       }),
                      //   }),
                      subCommand: 3,
                  }
                : {
                        "callId": 1478605543,
                        "callType": 1,
                        "data": {
                          "codec": "",
                          "data": {
                            "groupAvatar": "",
                            "groupName": "hello everyone",
                            "hostCall": 284398598,
                            "maxUsers": 8,
                            "noiseId": [
                              "4455147896864835474",
                              "6141287430918309499"
                            ]
                          },
                          "extendData": "",
                          "rtcpAddress": "42.119.138.122:3500",
                          "rtcpAddressIPv6": "2405:4800:ae00:1b01::210:3500",
                          "rtpAddress": "42.119.138.122:3000",
                          "rtpAddressIPv6": "2405:4800:ae00:1b01::210:3000"
                        },
                        "session": "3SLpI9BgQtm5_6r-fEbYBmwUF7MImtilQfikJVcs9aTGe2n6-RCZHrYhT3lBvGvLMxHQD9GRZvre7R2WzvTRzUgpPSDulWFdlD8SkNwkF8NhuZ7jDkn7-VcRFvb4-YNzyu9Cm2OWNPSFdUPATG",
                        "partners": [
                          "4455147896864835474",
                          "6141287430918309499"
                        ],
                        "groupId": "842425408768004849"

                      
                  };

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
