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

export type UpdateQuickMessageResponse = {
    items: QuickMessage[];
    version: number;
};

export const updateQuickMessageFactory = apiFactory<UpdateQuickMessageResponse>()((api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.quick_message[0]}/api/quickmessage/update`);

    /**
     * Update quick message
     * @notes còn bản có thể up ảnh mà nhiều case quá huhu (dùng tạm bản không có nhé)
     * 
     * @param keyword - The keyword of the quick message
     * @param title - The title of the quick message
     * @param itemId - The id of the quick message to update
     *
     * @throws ZaloApiError
     */
    return async function updateQuickMessage(keyword: string, title: string, itemId: number) {
        const params = {
            itemId: itemId,
            keyword: keyword,
            message: {
                title: title,
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
