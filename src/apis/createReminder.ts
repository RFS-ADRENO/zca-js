import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type ReminderParams = {
    title: string;
    setTitle: boolean;
};

export type CreateReminderOptions = {
    title: string;
    emoji?: string;
    pinAct?: boolean;
};

export type CreateReminderResponse = {
    editorId: string;
    emoji: string;
    color: number;
    groupId: string;
    creatorId: string;
    editTime: number;
    eventType: number;
    params: ReminderParams;
    type: number;
    duration: number;
    repeatInfo: null;
    repeatData: any[];
    createTime: number;
    repeat: number;
    startTime: number;
    id: string;
};

export const createReminderFactory = apiFactory<CreateReminderResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.group_board[0]}/api/board/topic/createv2`);

    /**
     * Create a reminder in a group
     *
     * @param options reminder options
     * @param options.emoji reminder emoji
     * @param options.title reminder title
     * @param options.pinAct Pin action (pin reminder)
     * @param groupId Group ID to create note from
     *
     * @throws ZaloApiError
     */
    return async function createReminder(options: CreateReminderOptions, groupId: string) {
        const params = {
            grid: groupId,
            type: 0,
            color: -16777216, // TODO: options.color
            emoji: options.emoji || "",
            startTime: -1,
            duration: -1,
            params: JSON.stringify({
                title: options.title,
            }),
            repeat: 0,
            src: 1,
            imei: ctx.imei,
            pinAct: options.pinAct ? 1 : 0,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(serviceURL, {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });

        return utils.resolve(response);
    };
});
