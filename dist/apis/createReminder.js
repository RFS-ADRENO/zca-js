import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { ReminderRepeatMode, ThreadType } from "../models/index.js";
import { apiFactory } from "../utils.js";
export const createReminderFactory = apiFactory()((api, ctx, utils) => {
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
     * @throws {ZaloApiError}
     */
    return async function createReminder(options, threadId, type = ThreadType.User) {
        var _a, _b, _c, _d, _e, _f;
        const params = type === ThreadType.User
            ? {
                objectData: JSON.stringify({
                    toUid: threadId,
                    type: 0,
                    color: -16245706,
                    emoji: (_a = options.emoji) !== null && _a !== void 0 ? _a : "⏰",
                    startTime: (_b = options.startTime) !== null && _b !== void 0 ? _b : Date.now(),
                    duration: -1,
                    params: { title: options.title },
                    needPin: false,
                    repeat: (_c = options.repeat) !== null && _c !== void 0 ? _c : ReminderRepeatMode.None,
                    creatorUid: ctx.uid, // Note: for some reason, you can put any valid UID here instead of your own and it still works, atleast for mobile
                    src: 1,
                }),
                imei: ctx.imei,
            }
            : {
                grid: threadId,
                type: 0,
                color: -16245706,
                emoji: (_d = options.emoji) !== null && _d !== void 0 ? _d : "⏰",
                startTime: (_e = options.startTime) !== null && _e !== void 0 ? _e : Date.now(),
                duration: -1,
                params: JSON.stringify({
                    title: options.title,
                }),
                repeat: (_f = options.repeat) !== null && _f !== void 0 ? _f : ReminderRepeatMode.None,
                src: 1,
                imei: ctx.imei,
                pinAct: 0,
            };
        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams)
            throw new ZaloApiError("Failed to encrypt params");
        const response = await utils.request(serviceURL[type], {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });
        return utils.resolve(response);
    };
});
