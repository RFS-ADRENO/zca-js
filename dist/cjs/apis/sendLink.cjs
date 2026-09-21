'use strict';

var ZaloApiError = require('../Errors/ZaloApiError.cjs');
require('../models/AutoReply.cjs');
require('../models/Bank.cjs');
require('../models/Board.cjs');
var Enum = require('../models/Enum.cjs');
require('../models/FriendEvent.cjs');
require('../models/Group.cjs');
require('../models/GroupEvent.cjs');
require('../models/Reaction.cjs');
require('../models/Reminder.cjs');
require('../models/ZBusiness.cjs');
var utils = require('../utils.cjs');

const sendLinkFactory = utils.apiFactory()((api, ctx, utils) => {
    const serviceURL = {
        [Enum.ThreadType.User]: utils.makeURL(`${api.zpwServiceMap.chat[0]}/api/message/link`, {
            nretry: 0,
        }),
        [Enum.ThreadType.Group]: utils.makeURL(`${api.zpwServiceMap.group[0]}/api/group/sendlink`, {
            nretry: 0,
        }),
    };
    /**
     * Send link
     *
     * @param options Link and ttl
     * @param threadId Thread ID
     * @param type Thread type
     *
     * @throws {ZaloApiError}
     */
    return async function sendLink(options, threadId, type = Enum.ThreadType.User) {
        var _a;
        const res = await api.parseLink(options.link);
        const params = {
            msg: options.msg && options.msg.trim()
                ? options.msg.includes(options.link)
                    ? options.msg
                    : options.msg + " " + options.link
                : options.link,
            href: res.data.href,
            src: res.data.src,
            title: res.data.title,
            desc: res.data.desc,
            thumb: res.data.thumb,
            type: 2, // 0
            media: JSON.stringify(res.data.media),
            ttl: (_a = options.ttl) !== null && _a !== void 0 ? _a : 0,
            clientId: Date.now(),
        };
        if (type == Enum.ThreadType.Group) {
            params.grid = threadId;
            params.imei = ctx.imei;
            // params.mentionInfo = "[]"; @TODO: implement this
        }
        else {
            params.toId = threadId;
            params.mentionInfo = "";
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

exports.sendLinkFactory = sendLinkFactory;
