import { ZaloApiError } from "../Errors/ZaloApiError.js";
import type { Gender, ZBusinessPackage } from "../models/index.js";
import { apiFactory } from "../utils.js";

export type GetMultiUsersByPhoneResponse = {
    [phoneNumber: string]: {
        avatar: string;
        cover: string;
        status: string;
        gender: Gender;
        dob: number;
        sdob: string;
        globalId: string;
        bizPkg: ZBusinessPackage;
        uid: string;
        zalo_name: string;
        display_name: string;
    };
};

export const getMultiUsersByPhoneFactory = apiFactory<GetMultiUsersByPhoneResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.friend[0]}/api/friend/profile/multiget`);

    /**
     * Get multiple user(s) by phone number
     *
     * @param phoneNumber Phone(s) number
     *
     * @throws {ZaloApiError}
     */
    return async function getMultiUsersByPhone(phoneNumber: string | string[]) {
        if (!Array.isArray(phoneNumber)) phoneNumber = [phoneNumber];
        
        const params = {
            phones: phoneNumber,
            avatar_size: 240,
            language: ctx.language,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
            method: "GET",
        });

        return utils.resolve(response);
    };
});