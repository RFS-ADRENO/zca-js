import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type GetPhoneBookResponse = {
    phonebook: {
        [userId: string]: string;
    },
    version: number;
};

export const getPhonebookFactory = apiFactory<GetPhoneBookResponse>()((api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.profile[0]}/api/social/friend/phonebook/v2`);

    /**
     * Get phonebook
     *
     * @throws {ZaloApiError}
     */
    return async function getPhonebook() {
        const params = {
            phonebook_version: 0
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
