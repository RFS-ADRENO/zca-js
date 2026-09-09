import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { ThreadType, CallType } from "../models/index.js";
import type { RequestCallUser, RequestCallGroup } from "../models/index.js";
import { apiFactory } from "../utils.js";

export type RequestCallPayload = {
    callId: number;
    /**
     * true: voice
     * false: video
     */
    callType?: boolean;
    groupAvatar?: string;
    groupName?: string;
    maxUsers?: number;
    userIds?: string[];
};

export type RequestCallResponse = RequestCallUser | RequestCallGroup;

export const requestCallFactory = apiFactory<RequestCallResponse>()((api, ctx, utils) => {
    const serviceURL = {
        [ThreadType.User]: utils.makeURL(`${api.zpwServiceMap.voice_call[0]}/api/voicecall/requestcall`, {
            apiType: 24,
            apiVersion: 667,
        }),
        [ThreadType.Group]: utils.makeURL(`${api.zpwServiceMap.voice_call[0]}/api/voicecall/group/requestcall`, {
            apiType: 24,
            apiVersion: 667,
        }),
    };

    /**
     * Request call User/Group
     *
     * @param payload request call
     * @param threadId threadId
     * @param type thread type
     *
     * @throws {ZaloApiError}
     */
    return async function requestCall(
        payload: RequestCallPayload,
        threadId: string,
        type: ThreadType = ThreadType.User,
    ) {
        if (type === ThreadType.Group && (!payload.userIds || payload.userIds.length === 0)) {
            throw new ZaloApiError("userIds is required when ThreadType.Group is used");
        }

        const isCallType = payload.callType ?? true;
        const maxUsers = Number.isFinite(payload.maxUsers)
            ? Math.max(1, payload.maxUsers!)
            : Math.max(payload.userIds?.length ?? 1, 8);
        const partnerIds = payload.userIds?.map((id) => String(id)) ?? [];

        const params =
            type === ThreadType.User
                ? {
                      calleeId: threadId,
                      callId: payload.callId,
                      codec: "[]\\n",
                      typeRequest: isCallType ? CallType.Voice : 3, // 1 voice, 3 on cam (idk)
                      imei: ctx.imei,
                  }
                : {
                      groupId: threadId,
                      callId: payload.callId,
                      typeRequest: isCallType ? CallType.Voice : CallType.Video, // 1 voice, 2 video
                      data:
                          "\n" +
                          JSON.stringify({
                              extraData: "",
                              groupAvatar: payload.groupAvatar || "",
                              groupId: threadId,
                              groupName: payload.groupName || "",
                              maxUsers: maxUsers,
                              noiseId: JSON.stringify(partnerIds) + "\n",
                          }) +
                          "\n",
                      partners: JSON.stringify(partnerIds) + "\n",
                  };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(utils.makeURL(serviceURL[type], { params: encryptedParams }), {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
