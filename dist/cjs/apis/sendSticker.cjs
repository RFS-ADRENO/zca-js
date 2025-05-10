'use strict';

var Enum = require('../models/Enum.cjs');
require('../models/FriendEvent.cjs');
require('../models/GroupEvent.cjs');
require('../models/Reaction.cjs');
var utils = require('../utils.cjs');
var ZaloApiError = require('../Errors/ZaloApiError.cjs');

const sendStickerFactory = utils.apiFactory()((api, ctx, utils$1) => {
    const serviceURL = {
        [Enum.ThreadType.User]: utils$1.makeURL(`${api.zpwServiceMap.chat[0]}/api/message/sticker`, {
            nretry: "0",
        }),
        [Enum.ThreadType.Group]: utils$1.makeURL(`${api.zpwServiceMap.group[0]}/api/group/sticker`, {
            nretry: "0",
        }),
    };
    /**
     * Send a sticker to a thread
     *
     * @param sticker Sticker object
     * @param threadId group or user id
     * @param type Message type (User or GroupMessage)
     *
     * @throws ZaloApiError
     */
    return async function sendSticker(sticker, threadId, type = Enum.ThreadType.User) {
        if (!sticker)
            throw new ZaloApiError.ZaloApiError("Missing sticker");
        if (!threadId)
            throw new ZaloApiError.ZaloApiError("Missing threadId");
        if (!sticker.id)
            throw new ZaloApiError.ZaloApiError("Missing sticker id");
        if (!sticker.cateId)
            throw new ZaloApiError.ZaloApiError("Missing sticker cateId");
        if (!sticker.type)
            throw new ZaloApiError.ZaloApiError("Missing sticker type");
        const isGroupMessage = type === Enum.ThreadType.Group;
        const params = {
            stickerId: sticker.id,
            cateId: sticker.cateId,
            type: sticker.type,
            clientId: Date.now(),
            imei: ctx.imei,
            zsource: 101,
            toid: isGroupMessage ? undefined : threadId,
            grid: isGroupMessage ? threadId : undefined,
        };
        utils.removeUndefinedKeys(params);
        const encryptedParams = utils$1.encodeAES(JSON.stringify(params));
        if (!encryptedParams)
            throw new ZaloApiError.ZaloApiError("Failed to encrypt message");
        const response = await utils$1.request(serviceURL[type].toString(), {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });
        return utils$1.resolve(response);
    };
});

exports.sendStickerFactory = sendStickerFactory;
