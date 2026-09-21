import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { ThreadType } from "../models/index.js";
import { apiFactory } from "../utils.js";
export const editReminderFactory = apiFactory()((api, ctx, utils) => {
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
     * @throws {ZaloApiError}
     */
    return async function editReminder(options, threadId, type = ThreadType.User) {
        var _a, _b, _c, _d, _e, _f;
        const requestParams = type === ThreadType.User
            ? {
                objectData: JSON.stringify({
                    toUid: threadId,
                    type: 0,
                    color: -16777216,
                    emoji: (_a = options.emoji) !== null && _a !== void 0 ? _a : "",
                    startTime: (_b = options.startTime) !== null && _b !== void 0 ? _b : Date.now(),
                    duration: -1,
                    params: { title: options.title },
                    needPin: false,
                    reminderId: options.topicId,
                    repeat: (_c = options.repeat) !== null && _c !== void 0 ? _c : 0,
                }),
            }
            : {
                grid: threadId,
                type: 0,
                color: -16777216,
                emoji: (_d = options.emoji) !== null && _d !== void 0 ? _d : "",
                startTime: (_e = options.startTime) !== null && _e !== void 0 ? _e : Date.now(),
                duration: -1,
                params: JSON.stringify({
                    title: options.title,
                }),
                topicId: options.topicId,
                repeat: (_f = options.repeat) !== null && _f !== void 0 ? _f : 0,
                imei: ctx.imei,
                pinAct: 2,
            };
        const encryptedParams = utils.encodeAES(JSON.stringify(requestParams));
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
