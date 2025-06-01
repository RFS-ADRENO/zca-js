import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type ConversInfo = {
    destId: string;
    isGroup: boolean;
    ttl: number;
    createdAt: number;
};

export type GetAutoDeleteChatResponse = {
    convers: ConversInfo[];
};

export const getAutoDeleteChatFactory = apiFactory<GetAutoDeleteChatResponse>()((api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.conversation[0]}/api/conv/autodelete/getConvers`);

    /**
     * Get auto delete chat
     *
     * @throws ZaloApiError
     *
     */
    return async function getAutoDeleteChat() {
        const params = {};

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
