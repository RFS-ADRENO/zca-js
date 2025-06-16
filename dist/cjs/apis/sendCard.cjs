'use strict';

var ZaloApiError = require('../Errors/ZaloApiError.cjs');
var Enum = require('../models/Enum.cjs');
require('../models/FriendEvent.cjs');
require('../models/GroupEvent.cjs');
require('../models/Reaction.cjs');
var utils = require('../utils.cjs');

const sendCardFactory = utils.apiFactory()((api, ctx, utils) => {
    const serviceURL = {
        [Enum.ThreadType.User]: utils.makeURL(`${api.zpwServiceMap.file[0]}/api/message/forward`),
        [Enum.ThreadType.Group]: utils.makeURL(`${api.zpwServiceMap.file[0]}/api/group/forward`),
    };
    /**
     * Send a card to a User - Group
     *
     * @param userId Unique ID for Card
     * @param phoneNumber Optional phone number for sending card to a User
     * @param ttl Time to live in miliseconds (default: 0)
     * @param threadId ID of the conversation
     * @param type Message type (User or GroupMessage)
     *
     * @throws ZaloApiError
     *
     */
    return async function sendCard(options, threadId, type = Enum.ThreadType.User) {
        var _a;
        const data = await api.getQR(options.userId);
        const QRCodeURL = data[options.userId];
        const clientId = Date.now().toString();
        const params = {
            ttl: (_a = options.ttl) !== null && _a !== void 0 ? _a : 0,
            msgType: 6,
            clientId: clientId,
            msgInfo: {
                contactUid: options.userId,
                qrCodeUrl: QRCodeURL,
            },
        };
        if (options.phoneNumber) {
            params.msgInfo.phone = options.phoneNumber;
        }
        if (type == Enum.ThreadType.Group) {
            params.visibility = 0;
            params.grid = threadId;
        }
        else {
            params.toId = threadId;
            params.imei = ctx.imei;
        }
        const msgInfoStringified = JSON.stringify(params.msgInfo);
        params.msgInfo = msgInfoStringified;
        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams)
            throw new ZaloApiError.ZaloApiError("Failed to encrypt params");
        const response = await utils.request(serviceURL[type], {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });
        return utils.resolve(response);
    };
});

exports.sendCardFactory = sendCardFactory;
