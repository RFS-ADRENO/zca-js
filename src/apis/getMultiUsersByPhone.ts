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
     * @param avatarSize Avatar size default 240 and 120
     *
     * @throws {ZaloApiError}
     */
    return async function getMultiUsersByPhone(phoneNumbers: string | string[], avatarSize: number = 240) {
        if (!phoneNumbers) throw new ZaloApiError("Missing phoneNumber");
        if (!Array.isArray(phoneNumbers)) phoneNumbers = [phoneNumbers];

        phoneNumbers = phoneNumbers.map((phone) => {
            if (phone.startsWith("0")) {
                if (ctx.language == "vi") phone = "84" + phone.slice(1);
            }
            return phone;
        });

        const params = {
            phones: phoneNumbers,
            avatar_size: avatarSize ?? 120,
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
