import { ZaloApiError } from "../Errors/ZaloApiError.js";
import type { BusinessCategory, Gender } from "../models/index.js";
import { apiFactory } from "../utils.js";

export type UpdateProfilePayload = {
    profile: {
        name: string;
        dob: `${string}-${string}-${string}`;
        gender: Gender;
    };
    biz?: Partial<{
        cate: BusinessCategory;
        description: string;
        address: string;
        website: string;
        email: string;
    }>;
};

export type ChangeAccountSettingResponse = "";

export const updateProfileFactory = apiFactory<ChangeAccountSettingResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.profile[0]}/api/social/profile/update`);

    /**
     * Change account setting information
     *
     * @param payload payload
     *
     * @note If your account is a Business Account, include the biz.cate field; otherwise the category will be removed.
     * You may leave the other biz fields empty if you don’t want to change them.
     *
     * @throws ZaloApiError
     */
    return async function updateProfile(payload: UpdateProfilePayload) {
        const params = {
            profile: JSON.stringify({
                name: payload.profile.name,
                dob: payload.profile.dob,
                gender: payload.profile.gender,
            }),
            biz: JSON.stringify({
                desc: payload.biz?.description,
                cate: payload.biz?.cate,
                addr: payload.biz?.address,
                website: payload.biz?.website,
                email: payload.biz?.email,
            }),
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
