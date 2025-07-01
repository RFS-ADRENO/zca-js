import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";
export const getAvatarListFactory = apiFactory()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.profile[0]}/api/social/avatar-list`);
    /**
     * Get avatar list
     *
     * @param options options
     *
     * @throws ZaloApiError
     */
    return async function getAvatarList(options) {
        var _a, _b;
        const params = {
            page: (_a = options.page) !== null && _a !== void 0 ? _a : 1,
            albumId: "0",
            count: (_b = options.count) !== null && _b !== void 0 ? _b : 50,
            imei: ctx.imei,
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
