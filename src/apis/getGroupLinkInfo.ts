import { ZaloApiError } from "../Errors/ZaloApiError.js";
import type { GroupSetting } from "../models/index.js";
import { apiFactory } from "../utils.js";

export type GetGroupLinkInfoPayload = {
    link: string;
    memberPage?: number;
};

export type GetGroupLinkInfoResponse = {
    groupId: string;
    name: string;
    desc: string;
    type: number;
    creatorId: string;
    avt: string;
    fullAvt: string;
    adminIds: string[];
    currentMems: {
        id: string;
        dName: string;
        zaloName: string;
        avatar: string;
        avatar_25: string;
        accountStatus: number;
        type: number;
    }[];
    admins: unknown[];
    hasMoreMember: number;
    subType: number;
    totalMember: number;
    setting: GroupSetting;
    globalId: string;
};

export const getGroupLinkInfoFactory = apiFactory<GetGroupLinkInfoResponse>()((api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.group[0]}/api/group/link/ginfo`);

    /**
     * Get group link info
     *
     * @param payload - The payload of the request
     *
     * @throws ZaloApiError
     */
    return async function getGroupLinkInfo(payload: GetGroupLinkInfoPayload) {
        const params = {
            link: payload.link,
            avatar_size: 120,
            member_avatar_size: 120,
            mpage: payload.memberPage ?? 1,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
