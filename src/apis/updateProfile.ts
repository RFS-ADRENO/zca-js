import { ZaloApiError } from "../Errors/ZaloApiError.js";
import type { BusinessCategory, Gender } from "../models/index.js";
import { apiFactory } from "../utils.js";

export type UpdateProfilePayload = {
    name: string;
    dob: `${string}-${string}-${string}`;
    gender: Gender;

    description?: string;
    cate?: BusinessCategory;
    address?: string;
    website?: string;
    email?: string;
};

export type ChangeAccountSettingResponse = "";

export const updateProfileFactory = apiFactory<ChangeAccountSettingResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.profile[0]}/api/social/profile/update`);

    /**
     * Change account setting information
     *
     * @param payload payload
     * @param isBusiness add info for business
     *
     * @throws ZaloApiError
     */
    return async function updateProfile(payload: UpdateProfilePayload, isBusiness: boolean = false) {
        const zBusiness = {
            desc: payload.description,
            cate: payload.cate,
            addr: payload.address,
            website: payload.website,
            email: payload.email,
        };
        const infoBusiness = isBusiness ? JSON.stringify(zBusiness) : JSON.stringify({});

        const params = {
            profile: JSON.stringify({
                name: payload.name,
                dob: payload.dob,
                gender: payload.gender,
            }),
            biz: infoBusiness,
            language: ctx.language,
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
