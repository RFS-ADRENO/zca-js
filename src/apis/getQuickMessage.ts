import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type Message = {
    title: string;
    params: string | null;
};

export type QuickMessage = {
    id: number;
    keyword: string;
    type: number;
    createdTime: number;
    lastModified: number;
    message: Message;
    media: null;
};

export type GetQuickMessageResponse = {
    cursor: number;
    version: number;
    items: QuickMessage[];
};

export const getQuickMessageFactory = apiFactory<GetQuickMessageResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.quick_message[0]}/api/quickmessage/list`);

    /**
     * Get quick message
     *
     * @throws ZaloApiError
     */
    return async function getQuickMessage() {
        const params = {
            version: 0,
            lang: 0,
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
