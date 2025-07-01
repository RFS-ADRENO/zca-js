'use strict';

var ZaloApiError = require('../Errors/ZaloApiError.cjs');
var Enum = require('../models/Enum.cjs');
require('../models/FriendEvent.cjs');
require('../models/GroupEvent.cjs');
require('../models/Reaction.cjs');
var utils = require('../utils.cjs');

const getListReminderFactory = utils.apiFactory()((api, ctx, utils) => {
    const serviceURL = {
        [Enum.ThreadType.User]: utils.makeURL(`${api.zpwServiceMap.group_board[0]}/api/board/oneone/list`),
        [Enum.ThreadType.Group]: utils.makeURL(`${api.zpwServiceMap.group_board[0]}/api/board/listReminder`),
    };
    /**
     * Get list reminder
     *
     * @param params - The parameters for the request
     * @param threadId - The ID of the thread
     * @param type - The type of the thread (User or Group)
     *
     * @throws ZaloApiError
     *
     */
    return async function getListReminder(params, threadId, type = Enum.ThreadType.User) {
        var _a, _b, _c, _d, _e;
        const requestParams = Object.assign({ objectData: JSON.stringify(type === Enum.ThreadType.User
                ? {
                    uid: threadId,
                    board_type: 1,
                    page: (_a = params.page) !== null && _a !== void 0 ? _a : 1,
                    count: (_b = params.count) !== null && _b !== void 0 ? _b : 20,
                    last_id: 0,
                    last_type: 0,
                }
                : {
                    group_id: threadId,
                    board_type: (_c = params.board_type) !== null && _c !== void 0 ? _c : 1,
                    page: (_d = params.page) !== null && _d !== void 0 ? _d : 1,
                    count: (_e = params.count) !== null && _e !== void 0 ? _e : 20,
                    last_id: 0,
                    last_type: 0,
                }) }, (type === Enum.ThreadType.Group && { imei: ctx.imei }));
        const encryptedParams = utils.encodeAES(JSON.stringify(requestParams));
        if (!encryptedParams)
            throw new ZaloApiError.ZaloApiError("Failed to encrypt params");
        const response = await utils.request(utils.makeURL(serviceURL[type], { params: encryptedParams }), {
            method: "GET",
        });
        return utils.resolve(response);
    };
});

exports.getListReminderFactory = getListReminderFactory;
