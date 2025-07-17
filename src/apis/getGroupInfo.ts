import { ZaloApiError } from "../Errors/ZaloApiError.js";
import type { GroupSetting } from "../models/GroupEvent.js";
import { apiFactory } from "../utils.js";

export type GroupInfoResponse = {
    removedsGroup: string[];
    unchangedsGroup: string[];
    gridInfoMap: {
        [groupId: string]: GroupInfo;
    };
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
    pendingApprove: GroupInfoPendingApprove;
    extraInfo: GroupInfoExtra;
};

export type GroupInfoPendingApprove = {
    time: number;
    uids: null | string[];
};

export type GroupInfoExtra = {
    enable_media_store: number;
};

export const getGroupInfoFactory = apiFactory<GroupInfoResponse>()((api, _, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.group[0]}/api/group/getmg-v2`);

    /**
     * Get group information
     *
     * @param groupId Group ID or list of group IDs
     *
     * @throws ZaloApiError
     */
    return async function getGroupInfo(groupId: string | string[]) {
        if (!Array.isArray(groupId)) groupId = [groupId];

        let params: any = {
            gridVerMap: {},
        };

        for (const id of groupId) {
            params.gridVerMap[id] = 0;
        }

        params.gridVerMap = JSON.stringify(params.gridVerMap);

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt message");

        const response = await utils.request(serviceURL, {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });

        return utils.resolve(response);
    };
});
