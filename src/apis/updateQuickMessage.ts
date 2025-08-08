import { ZaloApiError } from "../Errors/ZaloApiError.js";
import type { QuickMessage } from "../models/index.js";
import { apiFactory } from "../utils.js";

export type UpdateQuickMessagePayload = {
    keyword: string;
    title: string;
    // media?: null; @TODO: implement media handling
};

export type UpdateQuickMessageResponse = {
    items: QuickMessage[];
    version: number;
};

export const updateQuickMessageFactory = apiFactory<UpdateQuickMessageResponse>()((api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.quick_message[0]}/api/quickmessage/update`);

    /**
     * Update quick message
     *
     * @param updatePayload - The payload containing data to update the quick message
     * @param itemId - The id of the quick message to update
     *
     * @note Zalo might throw an error with code 212 if the itemId does not exist.
     *
     * @throws ZaloApiError
     */
    return async function updateQuickMessage(updatePayload: UpdateQuickMessagePayload, itemId: number) {
        const params = {
            itemId: itemId,
            keyword: updatePayload.keyword,
            message: {
                title: updatePayload.title,
                params: "",
            },
            media: null,
            type: 0,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
