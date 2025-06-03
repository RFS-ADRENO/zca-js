import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type RemoveReminderResponse = "";

export const removeReminderFactory = apiFactory<RemoveReminderResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.group_board[0]}/api/board/topic/remove`);

    /**
     * Remove a reminder in a group
     *
     * @param topicId Topic ID to remove reminder from
     * @param groupId Group ID to remove reminder from
     *
     * @throws ZaloApiError
     */
    return async function removeReminder(topicId: string, groupId: string) {
        const params = {
            grid: groupId,
            topicId: topicId,
            imei: ctx.imei,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(serviceURL, {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });

        return utils.resolve(response);
    };
});
