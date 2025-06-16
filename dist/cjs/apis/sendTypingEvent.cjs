'use strict';

var ZaloApiError = require('../Errors/ZaloApiError.cjs');
var Enum = require('../models/Enum.cjs');
var utils = require('../utils.cjs');

const sendTypingEventFactory = utils.apiFactory()((api, ctx, utils) => {
    const serviceURL = {
        [Enum.ThreadType.User]: utils.makeURL(`${api.zpwServiceMap.chat[0]}/api/message/typing`),
        [Enum.ThreadType.Group]: utils.makeURL(`${api.zpwServiceMap.group[0]}/api/group/typing`),
    };
    /**
     * Send typing event
     *
     * @param id The ID of the User or Group to send the typing event to
     * @param options The options to send the typing event
     *
     * @throws ZaloApiError
     */
    return async function sendTypingEvent(id, options) {
        if (!id)
            throw new ZaloApiError.ZaloApiError("Missing id");
        if (!options)
            throw new ZaloApiError.ZaloApiError("Missing options");
        if (options.type == null || options.type == undefined)
            throw new ZaloApiError.ZaloApiError("Missing options type");
        const { type } = options;
        if (type == Enum.ThreadType.User && !("destType" in options))
            throw new ZaloApiError.ZaloApiError("Missing destType for User thread");
        let destType = "destType" in options ? options.destType : undefined;
        const params = Object.assign(Object.assign({ [type === Enum.ThreadType.User ? "toid" : "grid"]: id }, (type === Enum.ThreadType.User ? { destType } : {})), { imei: ctx.imei });
        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams)
            throw new ZaloApiError.ZaloApiError("Failed to encrypt params");
        const response = await utils.request(serviceURL[type].toString(), {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });
        return utils.resolve(response);
    };
});

exports.sendTypingEventFactory = sendTypingEventFactory;
