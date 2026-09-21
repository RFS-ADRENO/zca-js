import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";
export const getGroupLinkInfoFactory = apiFactory()((api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.group[0]}/api/group/link/ginfo`);
    /**
     * Get group link info
     *
     * @param payload - The payload of the request
     *
     * @throws {ZaloApiError}
     */
    return async function getGroupLinkInfo(payload) {
        var _a;
        const params = {
            link: payload.link,
            avatar_size: 120,
            member_avatar_size: 120,
            mpage: (_a = payload.memberPage) !== null && _a !== void 0 ? _a : 1,
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
