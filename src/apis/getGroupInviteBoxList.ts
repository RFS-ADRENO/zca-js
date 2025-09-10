import { ZaloApiError } from "../Errors/ZaloApiError.js";
import type { GroupInfo } from "../models/index.js";
import { apiFactory } from "../utils.js";

export type GetGroupInviteBoxListPayload = {
    mpage?: number;
    page?: number;
    invPerPage?: number;
    mcount?: number;
};

export type GetGroupInviteBoxListResponse = {
    invitations: {
        groupInfo: GroupInfo;
        inviterInfo: {
            id: string;
            dName: string;
            zaloName: string;
            avatar: string;
            avatar_25: string;
            accountStatus: number;
            type: number;
        };
        grCreatorInfo: {
            id: string;
            dName: string;
            zaloName: string;
            avatar: string;
            avatar_25: string;
            accountStatus: number;
            type: number;
        };
        /**
         * Expired timestamp max 7 days
         */
        expiredTs: string;
        type: number;
    }[];
    total: number;
    hasMore: boolean;
};

export const getGroupInviteBoxListFactory = apiFactory<GetGroupInviteBoxListResponse>()((api, _, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.group[0]}/api/group/inv-box/list`);

    /**
     * Get group invite box list
     *
     * @param payload - The payload of the request
     *
     * @throws ZaloApiError
     */
    return async function getGroupInviteBoxList(payload: GetGroupInviteBoxListPayload) {
        const params = {
            mpage: payload.mpage ?? 1,
            page: payload.page ?? 0,
            invPerPage: payload.invPerPage ?? 12,
            mcount: payload.mcount ?? 10,
            lastGroupId: null, // @TODO: check type
            avatar_size: 120,
            member_avatar_size: 120,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
