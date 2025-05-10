import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";
export const changeFriendAliasFactory = apiFactory()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.alias[0]}/api/alias/update`);
    /**
     * Change friend's alias
     *
     * @param alias
     * @param friendId
     *
     * @throws ZaloApiError
     *
     */
    return async function changeFriendAlias(alias, friendId) {
        const params = {
            friendId: friendId,
            alias: alias,
            imei: ctx.imei,
        };
        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams)
            throw new ZaloApiError("Failed to encrypt params");
        const urlWithParams = `${serviceURL}&params=${encodeURIComponent(encryptedParams)}`;
        const response = await utils.request(urlWithParams, {
            method: "GET",
        });
        return utils.resolve(response);
    };
});
