import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type GetArchivedChatListResponse = {
    items: any[]; // @TODO: check type
    version: number;
};

export const getArchivedChatListFactory = apiFactory<GetArchivedChatListResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.label[0]}/api/archivedchat/list`);

    /**
     * Get arcnived chat list
     *
     * @throws ZaloApiError
     */
    return async function getArchivedChatList() {
        const params = {
            version: 1,
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
