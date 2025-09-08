import { ZaloApiError } from "../Errors/ZaloApiError.js";
import type { DetailGroupInfo } from "../models/index.js";
import { apiFactory } from "../utils.js";

export type GetGroupInviteBoxInfoPayload = {
    groupId: string;
    mpage?: number;
    mcount?: number;
};

export type GetGroupInviteBoxInfoResponse = {
    groupInfo: DetailGroupInfo;
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
    expiredTs: string;
    type: number;
};

export const getGroupInviteBoxInfoFactory = apiFactory<GetGroupInviteBoxInfoResponse>()((api, _, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.group[0]}/api/group/inv-box/inv-info`);

    /**
     * Get group invite box info
     *
     * @param payload - The payload of the request
     *
     * @throws ZaloApiError
     */
    return async function getGroupInviteBoxInfo(payload: GetGroupInviteBoxInfoPayload) {
        const params = {
            grId: payload.groupId,
            mcount: payload.mcount ?? 10,
            mpage: payload.mpage ?? 1,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
            method: "GET",
        });

        return utils.resolve(response, (result) => {
            const data = result.data as Omit<GetGroupInviteBoxInfoResponse, "params"> & { params: unknown };
            if (typeof data.params == "string") {
                data.params = JSON.parse(data.params);
            }

            return data as GetGroupInviteBoxInfoResponse;
        });
    };
});
