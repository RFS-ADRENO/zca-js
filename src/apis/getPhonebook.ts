import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type GetPhoneBookResponse = {
    phonebook: {
        [userId: string]: string;
    },
    version: number;
};

export const getPhonebookFactory = apiFactory<GetPhoneBookResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.profile[0]}/api/social/friend/phonebook/v2`);

    /**
     * Get phonebook
     * 
     * @param phoneBookVer Phonebook version you already have (default: the version from login). You can pass in parameter 0 or ctx
     *
     * @throws {ZaloApiError}
     */
    return async function getPhonebook(phoneBookVer: number = ctx.extraVer!.phonebook) {
        const params = {
            phonebook_version: phoneBookVer
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
