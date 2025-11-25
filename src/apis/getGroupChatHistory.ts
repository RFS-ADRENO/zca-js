import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type GetGroupChatHistoryResponse = {
    lastActionId: string;
    lastActionIdOther: string;
    more: number;
    // @TODO: check type
    groupMsgs: unknown[];
};

export const getGroupChatHistoryFactory = apiFactory<GetGroupChatHistoryResponse>()((api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.group[0]}/api/group/history`);

    /**
     * Get group chat history
     *
     * @param groupId group id
     * @param count count of messages to return (default: 50)
     *
     * @throws {ZaloApiError}
     */
    return async function getGroupChatHistory(groupId: string, count: number = 50) {
        const params = {
            grid: groupId,
            count: count,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
