import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";
export const getReminderFactory = apiFactory()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.group_board[0]}/api/board/topic/getReminder`);
    /**
     * Get reminder
     *
     * @param eventId Event ID to get reminder from
     * @param groupId Group ID to get reminder from
     *
     * @throws ZaloApiError
     *
     */
    return async function getReminder(eventId, groupId) {
        const params = {
            eventId: eventId,
            imei: ctx.imei,
        };
        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams)
            throw new ZaloApiError("Failed to encrypt params");
        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
            method: "GET",
        });
        return utils.resolve(response);
    };
});
