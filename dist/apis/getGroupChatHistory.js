import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";
import { GroupMessage } from "../models/index.js";
export const getGroupChatHistoryFactory = apiFactory()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.group[0]}/api/group/history`);
    /**
     * Get group chat history
     *
     * @param groupId group id
     * @param count count of messages to return (default: 50)
     *
     * @throws {ZaloApiError}
     */
    return async function getGroupChatHistory(groupId, count = 50) {
        const params = {
            grid: groupId,
            count: count,
        };
        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams)
            throw new ZaloApiError("Failed to encrypt params");
        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
            method: "GET",
        });
        return utils.resolve(response, (result) => {
            let data = result.data;
            if (typeof data === "string") {
                data = JSON.parse(data);
            }
            for (let i = 0; i < data.groupMsgs.length; i++) {
                data.groupMsgs[i] = new GroupMessage(ctx.uid, data.groupMsgs[i]);
            }
            return data;
        });
    };
});
