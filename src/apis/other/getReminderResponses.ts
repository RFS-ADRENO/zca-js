import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils/index.js";

export type GetReminderResponsesResponse = {
    rejectMember: string[];
    acceptMember: string[];
};

export const getReminderResponsesFactory = apiFactory<GetReminderResponsesResponse>()((api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.group_board[0]}/api/board/topic/listResponseEvent`);

    /**
     * Get reminder responses
     *
     * @param reminderId reminder id
     *
     * @throws {ZaloApiError}
     */
    return async function getReminderResponses(reminderId: string) {
        const params = {
            eventId: reminderId,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
