import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { ThreadType } from "../models/index.js";
import { apiFactory } from "../utils.js";
export const removeReminderFactory = apiFactory()((api, ctx, utils) => {
    const serviceURL = {
        [ThreadType.User]: utils.makeURL(`${api.zpwServiceMap.group_board[0]}/api/board/oneone/remove`),
        [ThreadType.Group]: utils.makeURL(`${api.zpwServiceMap.group_board[0]}/api/board/topic/remove`),
    };
    /**
     * Remove a reminder in a (user/group)
     *
     * @param reminderId Reminder ID to remove reminder from
     * @param threadId (User/Group) ID to remove reminder from
     * @param type Thread type (User or Group)
     *
     * @throws {ZaloApiError}
     */
    return async function removeReminder(reminderId, threadId, type = ThreadType.User) {
        const params = type === ThreadType.User
            ? {
                uid: threadId,
                reminderId: reminderId,
            }
            : {
                grid: threadId,
                topicId: reminderId,
                imei: ctx.imei,
            };
        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams)
            throw new ZaloApiError("Failed to encrypt params");
        const response = await utils.request(serviceURL[type], {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });
        return utils.resolve(response);
    };
});
