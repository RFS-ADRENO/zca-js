import { ZaloApiError } from "../Errors/ZaloApiError.js";
import type { ReminderGroup, ReminderUser} from "../models/index.js";
import { ThreadType } from "../models/index.js";
import { apiFactory } from "../utils.js";

export type ListReminderOptions = {
    /**
     * Page number (default: 1)
     */
    page?: number;
    /**
     * Number of items to retrieve (default: 20)
     */
    count?: number;
};

export type ReminderListUser = ReminderUser;
export type ReminderListGroup = ReminderGroup & {
    groupId: string;
    eventType: number;
    responseMem: {
        rejectMember: number;
        myResp: number;
        acceptMember: number;
    };
    repeatInfo: {
        list_ts: unknown[];
    };
    repeatData: unknown[];
};

export type GetListReminderResponse = (ReminderListUser & ReminderListGroup)[];

export const getListReminderFactory = apiFactory<GetListReminderResponse>()((api, ctx, utils) => {
    const serviceURL = {
        [ThreadType.User]: utils.makeURL(`${api.zpwServiceMap.group_board[0]}/api/board/oneone/list`),
        [ThreadType.Group]: utils.makeURL(`${api.zpwServiceMap.group_board[0]}/api/board/listReminder`),
    };

    /**
     * Get list reminder
     *
     * @param options - The options for the request
     * @param threadId - The ID of the thread
     * @param type - The type of the thread (User or Group)
     *
     * @throws ZaloApiError
     */
    return async function getListReminder(
        options: ListReminderOptions,
        threadId: string,
        type: ThreadType = ThreadType.User,
    ) {
        const requestParams = {
            objectData: JSON.stringify(
                type === ThreadType.User
                    ? {
                          uid: threadId,
                          board_type: 1,
                          page: options.page ?? 1,
                          count: options.count ?? 20,
                          last_id: 0,
                          last_type: 0,
                      }
                    : {
                          group_id: threadId,
                          board_type: 1,
                          page: options.page ?? 1,
                          count: options.count ?? 20,
                          last_id: 0,
                          last_type: 0,
                      },
            ),
            ...(type === ThreadType.Group && { imei: ctx.imei }),
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(requestParams));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(utils.makeURL(serviceURL[type], { params: encryptedParams }), {
            method: "GET",
        });

        return utils.resolve(response, (result) => {
            return JSON.parse(result.data as string) as GetListReminderResponse;
        });
    };
});
