import { ZaloApiError } from "../Errors/ZaloApiError.js";
import type { ReminderRepeatMode, ReminderGroup, ReminderUser} from "../models/index.js";
import { ThreadType } from "../models/index.js";
import { apiFactory } from "../utils.js";

export type EditReminderOptions = {
    title: string;
    topicId: string;
    emoji?: string;
    startTime?: number;
    repeat?: ReminderRepeatMode;
};

export type CreateReminderUser = ReminderUser;
export type CreateReminderGroup = ReminderGroup & {
    groupId: string;
    eventType: number;
    repeatInfo: null;
    repeatData: unknown[];
};

export type EditReminderResponse = CreateReminderUser | CreateReminderGroup;

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
