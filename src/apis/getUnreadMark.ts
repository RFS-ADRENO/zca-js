import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type GetUnreadMarkResponse = {
    data: string;
    status: number;
};

export const getUnreadMarkFactory = apiFactory<GetUnreadMarkResponse>()((api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.conversation[0]}/api/conv/getUnreadMark`);

    /**
     * Get unread mark
     *
     * @throws ZaloApiError
     *
     */
    return async function getUnreadMark() {
        const params = {};

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
