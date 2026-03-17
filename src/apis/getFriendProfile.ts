import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type GetFriendProfilePayload = {
    phone: string;
    avatarSize?: number;
    language?: string;
    reqSrc?: number;
};

export type GetFriendProfileResponse = {
    avatar: string;
    cover: string;
    status: string;
    gender: number;
    dob: number;
    sdob: string;
    globalId: string;
    bizPkg: {
        pkgId: number;
    };
    uid: string;
    zalo_name: string;
    display_name: string;
};

export const getFriendProfileFactory = apiFactory<GetFriendProfileResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.friend[0]}/api/friend/profile/get`);

    /**
     * Get friend profile by phone number
     *
     * @param payload Friend profile request payload
     *
     * @throws {ZaloApiError}
     */
    return async function getFriendProfile(payload: GetFriendProfilePayload) {
        const params = {
            phone: payload.phone,
            avatar_size: payload.avatarSize || 240,
            language: payload.language || "vi",
            imei: ctx.imei,
            reqSrc: payload.reqSrc || 32,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
