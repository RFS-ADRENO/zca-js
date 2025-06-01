import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type ConversInfo = {
    destId: string;
    isGroup: boolean;
    ttl: number;
    createdAt: number;
};

export type GetAutoDeleteMessageResponse = {
    convers: ConversInfo[];
};

export const getAutoDeleteMessageFactory = apiFactory<GetAutoDeleteMessageResponse>()((api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.conversation[0]}/api/conv/autodelete/getConvers`);

    /**
     * Get auto delete message
     *
     * @throws ZaloApiError
     *
     */
    return async function getAutoDeleteMessage() {
        const params = {};

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
