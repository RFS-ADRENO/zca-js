import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

import { GroupMessage, type TGroupMessage } from "../models/index.js";

export type GetGroupChatHistoryResponse = {
    lastActionId: string;
    lastActionIdOther: string;
    more: number;
    groupMsgs: GroupMessage[];
};

export const getGroupChatHistoryFactory = apiFactory<GetGroupChatHistoryResponse>()((api, ctx, utils) => {
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

        return utils.resolve(response, (result) => {
            let data = result.data as unknown as GetGroupChatHistoryResponse | string;

            if (typeof data === "string") {
                data = JSON.parse(data) as GetGroupChatHistoryResponse;
            }

            for (let i = 0; i < data.groupMsgs.length; i++) {
                data.groupMsgs[i] = new GroupMessage(ctx.uid, data.groupMsgs[i] as unknown as TGroupMessage);
            }

            return data;
        });
    };
});
