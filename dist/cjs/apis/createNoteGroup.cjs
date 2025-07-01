'use strict';

var ZaloApiError = require('../Errors/ZaloApiError.cjs');
var utils = require('../utils.cjs');

const createNoteGroupFactory = utils.apiFactory()((api, ctx, utils$1) => {
    const serviceURL = utils$1.makeURL(`${api.zpwServiceMap.group_board[0]}/api/board/topic/createv2`);
    /**
     * Create a note in a group
     *
     * @param options note options
     * @param options.title note title
     * @param options.color note color
     * @param options.emoji note emoji
     * @param options.pinAct pin action (pin note)
     * @param groupId group id
     *
     * @throws ZaloApiError
     */
    return async function createNoteGroup(options, groupId) {
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
            repeat: 0,
            src: 1,
            imei: ctx.imei,
            pinAct: options.pinAct ? 1 : 0,
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

exports.createNoteGroupFactory = createNoteGroupFactory;
