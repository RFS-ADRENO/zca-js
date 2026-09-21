import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";
export const joinGroupLinkFactory = apiFactory()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.group[0]}/api/group/link/join`);
    /**
     * Join group via invite link
     *
     * @note Zalo might throw an error with code 240 if the group enabled membership approval, 178 if you are already a member.
     *
     * @param link - The link join group
     *
     * @throws {ZaloApiError}
     */
    return async function joinGroupLink(link) {
        const params = {
            link: link,
            clientLang: ctx.language,
        };
        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams)
            throw new ZaloApiError("Failed to encrypt params");
        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
            method: "GET",
        });
        return utils.resolve(response);
    };
});
