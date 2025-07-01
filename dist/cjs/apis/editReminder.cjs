'use strict';

var ZaloApiError = require('../Errors/ZaloApiError.cjs');
var Enum = require('../models/Enum.cjs');
require('../models/FriendEvent.cjs');
require('../models/GroupEvent.cjs');
require('../models/Reaction.cjs');
var utils = require('../utils.cjs');

const editReminderFactory = utils.apiFactory()((api, ctx, utils$1) => {
    const serviceURL = {
        [Enum.ThreadType.User]: utils$1.makeURL(`${api.zpwServiceMap.group_board[0]}/api/board/oneone/update`),
        [Enum.ThreadType.Group]: utils$1.makeURL(`${api.zpwServiceMap.group_board[0]}/api/board/topic/updatev2`),
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
    return async function editReminder(options, threadId, type = Enum.ThreadType.User) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        const requestParams = type === Enum.ThreadType.User
            ? {
                creatorUid: options.creatorUid,
                toUid: threadId,
                type: 0,
                color: options.color && options.color.trim() ? utils.hexToNegativeColor(options.color) : -16777216,
                emoji: (_a = options.emoji) !== null && _a !== void 0 ? _a : "",
                startTime: (_b = options.startTime) !== null && _b !== void 0 ? _b : Date.now(),
                duration: (_c = options.duration) !== null && _c !== void 0 ? _c : -1,
                params: JSON.stringify({
                    title: options.title,
                }),
                needPin: options.pinAct ? true : false,
                reminderId: options.topicId,
                repeat: (_d = options.repeat) !== null && _d !== void 0 ? _d : 0,
            }
            : {
                grid: threadId,
                type: 0,
                color: options.color && options.color.trim() ? utils.hexToNegativeColor(options.color) : -16777216,
                emoji: (_e = options.emoji) !== null && _e !== void 0 ? _e : "",
                startTime: (_f = options.startTime) !== null && _f !== void 0 ? _f : Date.now(),
                duration: (_g = options.duration) !== null && _g !== void 0 ? _g : -1,
                params: JSON.stringify({
                    title: options.title,
                }),
                topicId: options.topicId,
                repeat: (_h = options.repeat) !== null && _h !== void 0 ? _h : 0,
                imei: ctx.imei,
                pinAct: options.pinAct ? 1 : 2,
            };
        const encryptedParams = utils$1.encodeAES(JSON.stringify(requestParams));
        if (!encryptedParams)
            throw new ZaloApiError.ZaloApiError("Failed to encrypt params");
        const response = await utils$1.request(serviceURL[type], {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });
        return utils$1.resolve(response);
    };
});

exports.editReminderFactory = editReminderFactory;
