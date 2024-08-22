import { appContext } from "../context.js";
import { ZaloApiError } from "../Errors/ZaloApiError.js";
import type { GroupSetting } from "../models/GroupEvent.js";
import { encodeAES, handleZaloResponse, request } from "../utils.js";

export type GroupInfoResponse = {
    removedsGroup: string[];
    unchangedsGroup: string[];
    gridInfoMap: GridInfoMap;
};

export type GridInfoMap = {
    [groupId: string]: GroupInfo;
};

export type GroupInfo = {
    groupId: string;
    name: string;
    desc: string;
    type: number;
    creatorId: string;
    version: string;
    avt: string;
    fullAvt: string;
    memberIds: any[];
    adminIds: string[];
    currentMems: any[];
    updateMems: any[];
    memVerList: string[];
    admins: any[];
    hasMoreMember: number;
    subType: number;
    totalMember: number;
    maxMember: number;
    setting: GroupSetting;
    createdTime: number;
    visibility: number;
    globalId: string;
    e2ee: number;
    pendingApprove: PendingApprove;
    extraInfo: ExtraInfo;
};

export type PendingApprove = {
    time: number;
    uids: null | string[];
};

export type ExtraInfo = {
    enable_media_store: number;
};

export function getGroupInfoFactory(serviceURL: string) {
    /**
     * Get group information
     *
     * @param groupId Group ID or list of group IDs
     *
     * @throws ZaloApiError
     */
    return async function getGroupInfo(groupId: string | string[]) {
        if (!appContext.secretKey) throw new ZaloApiError("Secret key is not available");
        if (!appContext.imei) throw new ZaloApiError("IMEI is not available");
        if (!appContext.cookie) throw new ZaloApiError("Cookie is not available");
        if (!appContext.userAgent) throw new ZaloApiError("User agent is not available");

        if (!Array.isArray(groupId)) groupId = [groupId];

        let params: any = {
            gridVerMap: {},
        };

        for (const id of groupId) {
            params.gridVerMap[id] = 0;
        }

        params.gridVerMap = JSON.stringify(params.gridVerMap);

        const encryptedParams = encodeAES(appContext.secretKey, JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt message");

        const response = await request(serviceURL, {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });

        const result = await handleZaloResponse<GroupInfoResponse>(response);
        if (result.error) throw new ZaloApiError(result.error.message, result.error.code);

        return result.data as GroupInfoResponse;
    };
}
