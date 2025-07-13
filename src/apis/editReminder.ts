import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { ReminderRepeatMode, ThreadType } from "../models/index.js";
import { apiFactory, hexToNegativeColor } from "../utils.js";

export type EditReminderOptions = {
    title: string;
    topicId: string;
    emoji?: string;
    startTime?: number;
    repeat?: ReminderRepeatMode;
};

export type ReminderResponseUser = {
    creatorUid: string;
    toUid: string;
    emoji: string;
    color: number;
    reminderId: string;
    createTime: number;
    repeat: ReminderRepeatMode;
    startTime: number;
    editTime: number;
    endTime: number;
    params: {
        title: string;
        setTitle: boolean;
    };
    type: number;
};

export type ReminderResponseGroup = {
    editorId: string;
    emoji: string;
    color: number;
    groupId: string;
    creatorId: string;
    editTime: number;
    eventType: number;
    params: {
        title: string;
        setTitle: boolean;
    };
    type: number;
    duration: number;
    repeatInfo: null;
    repeatData: any[];
    createTime: number;
    repeat: number;
    startTime: number;
    id: string;
};

export type EditReminderResponse = ReminderResponseUser | ReminderResponseGroup;

export const editReminderFactory = apiFactory<EditReminderResponse>()((api, ctx, utils) => {
    const serviceURL = {
        [ThreadType.User]: utils.makeURL(`${api.zpwServiceMap.group_board[0]}/api/board/oneone/update`),
        [ThreadType.Group]: utils.makeURL(`${api.zpwServiceMap.group_board[0]}/api/board/topic/updatev2`),
    };

    /**
     * Edit an existing reminder
     *
     * @param options Reminder parameters
     * @param threadId Thread ID
     * @param type Thread type (User/Group)
     *
     * @throws ZaloApiError
     */
    return async function editReminder(
        options: EditReminderOptions,
        threadId: string,
        type: ThreadType = ThreadType.User,
    ) {
        const requestParams =
            type === ThreadType.User
                ? {
                      objectData: JSON.stringify({
                          toUid: threadId,
                          type: 0,
                          color: -16777216,
                          emoji: options.emoji ?? "",
                          startTime: options.startTime ?? Date.now(),
                          duration: -1,
                          params: { title: options.title },
                          needPin: false,
                          reminderId: options.topicId,
                          repeat: options.repeat ?? 0,
                      }),
                  }
                : {
                      grid: threadId,
                      type: 0,
                      color: -16777216,
                      emoji: options.emoji ?? "",
                      startTime: options.startTime ?? Date.now(),
                      duration: -1,
                      params: JSON.stringify({
                          title: options.title,
                      }),
                      topicId: options.topicId,
                      repeat: options.repeat ?? 0,
                      imei: ctx.imei,
                      pinAct: 2,
                  };

        const encryptedParams = utils.encodeAES(JSON.stringify(requestParams));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(serviceURL[type], {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });

        return utils.resolve(response);
    };
});
