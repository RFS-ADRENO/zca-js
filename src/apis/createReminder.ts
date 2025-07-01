import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { ThreadType } from "../models/index.js";
import { apiFactory, hexToNegativeColor } from "../utils.js";

export type CreateReminderOptions = {
    title: string;
    color?: string;
    emoji?: string;
    pinAct?: boolean;
    creatorUid?: string;
    startTime?: number;
    duration?: number;
    /**
     * Repeat mode for the reminder:
     * - 0: No repeat
     * - 1: Daily repeat
     * - 2: Weekly repeat
     * - 3: Monthly repeat
     */
    repeat?: number;
};

// type of group and user
export type CreateReminderResponse = {
    editorId?: string;
    emoji: string;
    color: number;
    groupId?: string;
    creatorId?: string;
    creatorUid?: string;
    toUid?: string;
    editTime: number;
    eventType?: number;
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
    id?: string;
    reminderId?: string;
    endTime: number;
};

export const createReminderFactory = apiFactory<CreateReminderResponse>()((api, ctx, utils) => {
    const serviceURL = {
        [ThreadType.User]: utils.makeURL(`${api.zpwServiceMap.group_board[0]}/api/board/oneone/create`),
        [ThreadType.Group]: utils.makeURL(`${api.zpwServiceMap.group_board[0]}/api/board/topic/createv2`),
    };

    /**
     * Create a reminder in a group
     *
     * @param options reminder options
     * @param options.title reminder title
     * @param options.color reminder color (hex color code - #0A7AFF/ 0A7AFF)
     * @param options.emoji reminder emoji
     * @param options.pinAct Pin action (pin reminder)
     * @param options.creatorUid Creator UID
     * @param options.startTime Start time
     * @param options.duration Duration
     * @param options.repeat Repeat mode for the reminder
     * @param threadId Group ID to create note from
     * @param type Thread type (User or Group)
     *
     * @throws ZaloApiError
     */
    return async function createReminder(
        options: CreateReminderOptions,
        threadId: string,
        type: ThreadType = ThreadType.User,
    ) {
        const params =
            type === ThreadType.User
                ? {
                      toUid: threadId,
                      type: 0,
                      color: options.color && options.color.trim() ? hexToNegativeColor(options.color) : -16245706,
                      emoji: options.emoji ?? "⏰",
                      startTime: options.startTime ?? Date.now(),
                      duration: options.duration ?? -1,
                      params: {
                          title: options.title,
                      },
                      needPin: options.pinAct ?? false,
                      repeat: options.repeat ?? 0,
                      creatorUid: options.creatorUid,
                      src: 3,
                      imei: ctx.imei,
                  }
                : {
                      grid: threadId,
                      type: 0,
                      color: options.color && options.color.trim() ? hexToNegativeColor(options.color) : -16245706,
                      emoji: options.emoji ?? "⏰",
                      startTime: options.startTime ?? Date.now(),
                      duration: options.duration ?? -1,
                      params: JSON.stringify({
                          title: options.title,
                      }),
                      repeat: options.repeat ?? 0,
                      src: 3,
                      imei: ctx.imei,
                      pinAct: options.pinAct ? 1 : 0,
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
