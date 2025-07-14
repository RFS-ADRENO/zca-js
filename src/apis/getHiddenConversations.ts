import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type GetHiddenConversationsResponse = {
    pin: string;
    threads: {
        /**
         * 1: true, 0: false
         */
        is_group: number;
        thread_id: string;
    }[];
};

export const getHiddenConversationsFactory = apiFactory<GetHiddenConversationsResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.conversation[0]}/api/hiddenconvers/get-all`);

    /**
     * Get hidden conversations
     *
     * @throws ZaloApiError
     *
     */
    return async function getHiddenConversations() {
        const params = {
            imei: ctx.imei,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
