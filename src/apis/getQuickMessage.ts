import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type QuickMessageMediaItem = {
    type: number;
    photoId: number;
    title: string;
    width: number;
    height: number;
    previewThumb: string;
    rawUrl: string;
    thumbUrl: string;
    normalUrl: string;
    hdUrl: string;
};

export type GetQuickMessageResponse = {
    cursor: number;
    version: number;
    items: {
        id: number;
        keyword: string;
        type: number;
        createdTime: number;
        lastModified: number;
        message: {
            title: string;
            params: string | null;
        };
        media: {
            items: QuickMessageMediaItem[];
        } | null;
    }[];
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
