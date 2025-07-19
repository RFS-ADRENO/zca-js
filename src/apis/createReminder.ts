import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { ReminderRepeatMode, ReminderGroup, ReminderUser, ThreadType } from "../models/index.js";
import { apiFactory } from "../utils.js";

export type CreateReminderOptions = {
    title: string;
    emoji?: string;
    startTime?: number;
    repeat?: ReminderRepeatMode;
};

export type CreateReminderResponse = ReminderUser | ReminderGroup;

export const createReminderFactory = apiFactory<CreateReminderResponse>()((api, ctx, utils) => {
    const serviceURL = {
        [ThreadType.User]: utils.makeURL(`${api.zpwServiceMap.group_board[0]}/api/board/oneone/create`),
        [ThreadType.Group]: utils.makeURL(`${api.zpwServiceMap.group_board[0]}/api/board/topic/createv2`),
    };

    /**
     * Create a reminder in a group
     *
     * @param options reminder options
     * @param threadId Group ID to create note from
     * @param type Thread type (User or Group)
     *
     * @throws ZaloApiError
     */
    return async function createReminder(
        options: CreateReminderOptions,
        threadId: string,
        type: ThreadType = ThreadType.User,
    ): Promise<CreateReminderResponse> {
        const params =
            type === ThreadType.User
                ? {
                      objectData: JSON.stringify({
                          toUid: threadId,
                          type: 0,
                          color: -16245706,
                          emoji: options.emoji ?? "⏰",
                          startTime: options.startTime ?? Date.now(),
                          duration: -1,
                          params: { title: options.title },
                          needPin: false,
                          repeat: options.repeat ?? ReminderRepeatMode.None,
                          creatorUid: ctx.uid, // Note: for some reason, you can put any valid UID here instead of your own and it still works, atleast for mobile
                          src: 1,
                      }),
                      imei: ctx.imei,
                  }
                : {
                      grid: threadId,
                      type: 0,
                      color: -16245706,
                      emoji: options.emoji ?? "⏰",
                      startTime: options.startTime ?? Date.now(),
                      duration: -1,
                      params: JSON.stringify({
                          title: options.title,
                      }),
                      repeat: options.repeat ?? ReminderRepeatMode.None,
                      src: 1,
                      imei: ctx.imei,
                      pinAct: 0,
                  };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
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
