import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type GetReminderEventResponse = {
    rejectMember: string[];
    acceptMember: string[];
};

export const getReminderEventFactory = apiFactory<GetReminderEventResponse>()((api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.group_board[0]}/api/board/topic/listResponseEvent`);

    /**
     * Get reminder event
     *
     * @param eventId event id
     *
     * @throws ZaloApiError
     */
    return async function getReminderEvent(eventId: string) {
        const params = {
            eventId: eventId
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
