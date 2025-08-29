import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { BusinessCategory } from "../models/index.js";
import { apiFactory } from "../utils.js";

export type GetBizAccountResponse = {
    biz?: {
        desc: string;
        cate: BusinessCategory;
        addr: string;
        website: string;
        email: string;
    };
    setting_start_page?: {
        enable_biz_label: number;
        enable_cate: number;
        enable_add: number;
        cta_profile: number;
        cta_catalog: any; // @TODO
    };
    pkgId: number;
};

export const getBizAccountFactory = apiFactory<GetBizAccountResponse>()((api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.profile[0]}/api/social/friend/get-bizacc`);

    /**
     * Get biz account
     *
     * @param friendId The friend ID to get biz account
     *
     * @throws ZaloApiError
     */
    return async function getBizAccount(friendId: string) {
        const params = {
            fid: friendId,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(serviceURL, {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });

        return utils.resolve(response);
    };
});
