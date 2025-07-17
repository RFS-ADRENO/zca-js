import { ZaloApiError } from "../Errors/ZaloApiError.js";
import type { QuickMessage } from "../models/QuickMessage.js";
import { apiFactory } from "../utils.js";

export type AddQuickMessageResponse = {
    items: QuickMessage[];
    version: number;
};

export const addQuickMessageFactory = apiFactory<AddQuickMessageResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.quick_message[0]}/api/quickmessage/create`);

    /**
     * Add quick message
     *
     * @param keyword - The keyword of the quick message
     * @param title - The title of the quick message
     *
     * @throws ZaloApiError
     */
    return async function addQuickMessage(keyword: string, title: string) {
        const params = {
            keyword: keyword,
            message: {
                title: title,
                params: "",
            },
            type: 0,
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
