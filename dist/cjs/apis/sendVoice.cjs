'use strict';

var ZaloApiError = require('../Errors/ZaloApiError.cjs');
var Enum = require('../models/Enum.cjs');
require('../models/FriendEvent.cjs');
require('../models/GroupEvent.cjs');
require('../models/Reaction.cjs');
var utils = require('../utils.cjs');

const sendVoiceFactory = utils.apiFactory()((api, ctx, utils) => {
    const serviceURL = {
        [Enum.ThreadType.User]: utils.makeURL(`${api.zpwServiceMap.file[0]}/api/message/forward`),
        [Enum.ThreadType.Group]: utils.makeURL(`${api.zpwServiceMap.file[0]}/api/group/forward`),
    };
    /**
     * Send a voice to a User - Group
     *
     * @param options voice options
     * @param threadId ID of the user or group to send the voice to
     * @param type Type of thread, default user
     *
     * @throws ZaloApiError
     */
    return async function sendVoice(options, threadId, type = Enum.ThreadType.User) {
        var _a, _b;
        let fileSize = null;
        let clientId = Date.now().toString();
        try {
            const headResponse = await utils.request(options.voiceUrl, { method: "HEAD" }, true);
            if (headResponse.ok) {
                fileSize = parseInt(headResponse.headers.get("content-length") || "0");
            }
        }
        catch (error) {
            throw new ZaloApiError.ZaloApiError(`Unable to get voice content: ${(error === null || error === void 0 ? void 0 : error.message) || error}`);
        }
        const params = type === Enum.ThreadType.User
            ? {
                toId: threadId,
                ttl: (_a = options.ttl) !== null && _a !== void 0 ? _a : 0,
                zsource: -1,
                msgType: 3,
                clientId: clientId,
                msgInfo: JSON.stringify({
                    voiceUrl: options.voiceUrl,
                    m4aUrl: options.voiceUrl,
                    fileSize: fileSize !== null && fileSize !== void 0 ? fileSize : 0,
                }),
                imei: ctx.imei,
            }
            : {
                grid: threadId,
                visibility: 0,
                ttl: (_b = options.ttl) !== null && _b !== void 0 ? _b : 0,
                zsource: -1,
                msgType: 3,
                clientId: clientId,
                msgInfo: JSON.stringify({
                    voiceUrl: options.voiceUrl,
                    m4aUrl: options.voiceUrl,
                    fileSize: fileSize !== null && fileSize !== void 0 ? fileSize : 0,
                }),
                imei: ctx.imei,
            };
        if (type !== Enum.ThreadType.User && type !== Enum.ThreadType.Group) {
            throw new ZaloApiError.ZaloApiError("Thread type is invalid");
        }
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

exports.sendVoiceFactory = sendVoiceFactory;
