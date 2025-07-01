import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { ThreadType } from "../models/index.js";
import { apiFactory, hexToNegativeColor } from "../utils.js";
export const createReminderFactory = apiFactory()((api, ctx, utils) => {
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
    return async function createReminder(options, threadId, type = ThreadType.User) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        const params = type === ThreadType.User
            ? {
                toUid: threadId,
                type: 0,
                color: options.color && options.color.trim() ? hexToNegativeColor(options.color) : -16245706,
                emoji: (_a = options.emoji) !== null && _a !== void 0 ? _a : "⏰",
                startTime: (_b = options.startTime) !== null && _b !== void 0 ? _b : Date.now(),
                duration: (_c = options.duration) !== null && _c !== void 0 ? _c : -1,
                params: {
                    title: options.title,
                },
                needPin: (_d = options.pinAct) !== null && _d !== void 0 ? _d : false,
                repeat: (_e = options.repeat) !== null && _e !== void 0 ? _e : 0,
                creatorUid: options.creatorUid,
                src: 3,
                imei: ctx.imei,
            }
            : {
                grid: threadId,
                type: 0,
                color: options.color && options.color.trim() ? hexToNegativeColor(options.color) : -16245706,
                emoji: (_f = options.emoji) !== null && _f !== void 0 ? _f : "⏰",
                startTime: (_g = options.startTime) !== null && _g !== void 0 ? _g : Date.now(),
                duration: (_h = options.duration) !== null && _h !== void 0 ? _h : -1,
                params: JSON.stringify({
                    title: options.title,
                }),
                repeat: (_j = options.repeat) !== null && _j !== void 0 ? _j : 0,
                src: 3,
                imei: ctx.imei,
                pinAct: options.pinAct ? 1 : 0,
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
