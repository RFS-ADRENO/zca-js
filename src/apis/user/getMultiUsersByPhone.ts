import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils/index.js";
import { AvatarSize, type UserBasic } from "../../models/index.js";

export type GetMultiUsersByPhoneResponse = {
    [phoneNumber: string]: UserBasic;
};

export const getMultiUsersByPhoneFactory = apiFactory<GetMultiUsersByPhoneResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.friend[0]}/api/friend/profile/multiget`);

    /**
     * Get multiple user(s) by phone number
     *
     * @param phoneNumber Phone(s) number
     * @param avatarSize Is avatar size max (default: true)
     *
     * @throws {ZaloApiError}
     */
    return async function getMultiUsersByPhone(phoneNumbers: string | string[], avatarSize: AvatarSize = AvatarSize.s120) {
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
            avatar_size: avatarSize,
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
