import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { ThreadType } from "../models/index.js";
import { apiFactory } from "../utils.js";
export const getListReminderFactory = apiFactory()((api, ctx, utils) => {
    const serviceURL = {
        [ThreadType.User]: utils.makeURL(`${api.zpwServiceMap.group_board[0]}/api/board/oneone/list`),
        [ThreadType.Group]: utils.makeURL(`${api.zpwServiceMap.group_board[0]}/api/board/listReminder`),
    };
    /**
     * Get list reminder
     *
     * @param options - The options for the request
     * @param threadId - The ID of the thread
     * @param type - The type of the thread (User or Group)
     *
     * @throws {ZaloApiError}
     */
    return async function getListReminder(options, threadId, type = ThreadType.User) {
        var _a, _b, _c, _d;
        const requestParams = Object.assign({ objectData: JSON.stringify(type === ThreadType.User
                ? {
                    uid: threadId,
                    board_type: 1,
                    page: (_a = options.page) !== null && _a !== void 0 ? _a : 1,
                    count: (_b = options.count) !== null && _b !== void 0 ? _b : 20,
                    last_id: 0,
                    last_type: 0,
                }
                : {
                    group_id: threadId,
                    board_type: 1,
                    page: (_c = options.page) !== null && _c !== void 0 ? _c : 1,
                    count: (_d = options.count) !== null && _d !== void 0 ? _d : 20,
                    last_id: 0,
                    last_type: 0,
                }) }, (type === ThreadType.Group && { imei: ctx.imei }));
        const encryptedParams = utils.encodeAES(JSON.stringify(requestParams));
        if (!encryptedParams)
            throw new ZaloApiError("Failed to encrypt params");
        const response = await utils.request(utils.makeURL(serviceURL[type], { params: encryptedParams }), {
            method: "GET",
        });
        return utils.resolve(response, (result) => {
            return JSON.parse(result.data);
        });
    };
});
