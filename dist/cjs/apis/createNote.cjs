'use strict';

var ZaloApiError = require('../Errors/ZaloApiError.cjs');
var utils = require('../utils.cjs');

const createNoteFactory = utils.apiFactory()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.group_board[0]}/api/board/topic/createv2`);
    /**
     * Create a note in a group
     *
     * @param options note options
     * @param options.title note title
     * @param options.pinAct pin action (pin note)
     * @param groupId group id
     *
     * @throws {ZaloApiError}
     */
    return async function createNote(options, groupId) {
        const params = {
            grid: groupId,
            type: 0,
            color: -16777216,
            emoji: "",
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
        if (!encryptedParams)
            throw new ZaloApiError.ZaloApiError("Failed to encrypt params");
        const response = await utils.request(serviceURL, {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });
        return utils.resolve(response, (result) => {
            if (typeof result.data.params === "string") {
                result.data.params = JSON.parse(result.data.params);
            }
            return result.data;
        });
    };
});

exports.createNoteFactory = createNoteFactory;
