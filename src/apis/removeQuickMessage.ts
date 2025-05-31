import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type RemoveQuickMessageResponse = {
    itemIds: number[];
    version: number;
};

export const removeQuickMessageFactory = apiFactory<RemoveQuickMessageResponse>()((api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.quick_message[0]}/api/quickmessage/delete`);

    /**
     * Remove quick message
     *
     * @param itemIds - The id(s) of the quick message(s) to remove (number or number[])
     *
     * @throws ZaloApiError
     */
    return async function removeQuickMessage(itemIds: number | number[]) {
        const idsArray = Array.isArray(itemIds) ? itemIds : [itemIds];
        
        const params = {
            itemIds: idsArray,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
