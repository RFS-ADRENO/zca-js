import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { ThreadType } from "../models/index.js";
import { apiFactory } from "../utils.js";

export type ListReminderParams = {
    /**
     * Board type for group listing reminders:
     * - 1: Default board type
     * - 2: Second board type
     * - 3: Third board type
     */
    board_type?: number;
    page?: number;
    count?: number;
};

export type ResponseMemInfo = {
    rejectMember: number;
    myResp: number;
    acceptMember: number;
};

export type ParamsInfo = {
    title: string;
    setTitle: boolean;
};

export type RepeatInfo = {
    list_ts: any[];
};

export type ReminderItem = {
    editorId: string;
    emoji: string;
    color: number;
    groupId: string;
    creatorId: string;
    editTime: number;
    eventType: number;
    responseMem: ResponseMemInfo;
    params: ParamsInfo;
    type: number;
    duration: number;
    repeatInfo: RepeatInfo;
    repeatData: any[];
    createTime: number;
    repeat: number;
    startTime: number;
    id: string;
};

export type GetListReminderResponse = ReminderItem[];

export const getListReminderFactory = apiFactory<GetListReminderResponse>()((api, ctx, utils) => {
    const serviceURL = {
        [ThreadType.User]: utils.makeURL(`${api.zpwServiceMap.group_board[0]}/api/board/oneone/list`),
        [ThreadType.Group]: utils.makeURL(`${api.zpwServiceMap.group_board[0]}/api/board/listReminder`),
    };

    /**
     * Get list reminder
     *
     * @param params - The parameters for the request
     * @param threadId - The ID of the thread
     * @param type - The type of the thread (User or Group)
     *
     * @throws ZaloApiError
     *
     */
    return async function getListReminder(
        params: ListReminderParams,
        threadId: string,
        type: ThreadType = ThreadType.User,
    ) {
        const requestParams = {
            objectData: JSON.stringify(
                type === ThreadType.User
                    ? {
                          uid: threadId,
                          board_type: 1,
                          page: params.page ?? 1,
                          count: params.count ?? 20,
                          last_id: 0,
                          last_type: 0,
                      }
                    : {
                          group_id: threadId,
                          board_type: params.board_type ?? 1,
                          page: params.page ?? 1,
                          count: params.count ?? 20,
                          last_id: 0,
                          last_type: 0,
                      },
            ),
            ...(type === ThreadType.Group && { imei: ctx.imei }),
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(requestParams));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(utils.makeURL(serviceURL[type].toString(), { params: encryptedParams }), {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
