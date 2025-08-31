import { ZaloApiError } from "../Errors/ZaloApiError.js";
import type { ReminderGroup } from "../models/index.js";
import { apiFactory } from "../utils.js";

export type GetReminderResponse = ReminderGroup & {
    groupId: string;
    eventType: number;
    responseMem: {
        rejectMember: number;
        myResp: number;
        acceptMember: number;
    };
    repeatInfo: null;
    repeatData: unknown[];
};

export const getReminderFactory = apiFactory<GetReminderResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.group_board[0]}/api/board/topic/getReminder`);

    /**
     * Get reminder details from a group
     *
     * @param reminderId Reminder ID
     *
     * @throws ZaloApiError
     */
    return async function getReminder(reminderId: string) {
        const params = {
            eventId: reminderId,
            imei: ctx.imei,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
