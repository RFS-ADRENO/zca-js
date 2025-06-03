import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type ListReminderParams = {
    page: number;
    count: number;
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
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.group_board[0]}/api/board/listReminder`);

    /**
     * Get list reminder
     *
     * @param params - The parameters for the request
     * @param groupId - The ID of the group
     *
     * @throws ZaloApiError
     *
     */
    return async function getListReminder(params: ListReminderParams, groupId: string) {
        const requestParams = {
            objectData: JSON.stringify({
                group_id: groupId,
                board_type: 1,
                page: params.page || 1,
                count: params.count || 20,
                last_id: 0,
                last_type: 0,
            }),
            imei: ctx.imei,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(requestParams));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
