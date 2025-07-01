'use strict';

var ZaloApiError = require('../Errors/ZaloApiError.cjs');
var utils = require('../utils.cjs');

const editNoteGroupFactory = utils.apiFactory()((api, ctx, utils$1) => {
    const serviceURL = utils$1.makeURL(`${api.zpwServiceMap.group_board[0]}/api/board/topic/updatev2`);
    /**
     * Edit an existing note in a group
     *
     * @param options.title note title
     * @param options.topicId Topic ID to edit note from
     * @param options.color note color
     * @param options.emoji note emoji
     * @param options.pinAct pin action (pin note)
     * @param groupId Group ID to create note from
     *
     * @throws ZaloApiError
     */
    return async function editNoteGroup(options, groupId) {
        var _a;
        const params = {
            grid: groupId,
            type: 0,
            color: options.color && options.color.trim() ? utils.hexToNegativeColor(options.color) : -16777216,
            emoji: (_a = options.emoji) !== null && _a !== void 0 ? _a : "",
            startTime: -1,
            duration: -1,
            params: JSON.stringify({
                title: options.title,
            }),
            topicId: options.topicId,
            repeat: 0,
            imei: ctx.imei,
            pinAct: options.pinAct ? 1 : 2,
        };
        const encryptedParams = utils$1.encodeAES(JSON.stringify(params));
        if (!encryptedParams)
            throw new ZaloApiError.ZaloApiError("Failed to encrypt params");
        const response = await utils$1.request(serviceURL, {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });
        return utils$1.resolve(response);
    };
});

exports.editNoteGroupFactory = editNoteGroupFactory;
