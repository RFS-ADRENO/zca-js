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

exports.MuteDuration = void 0;
(function (MuteDuration) {
    MuteDuration[MuteDuration["ONE_HOUR"] = 3600] = "ONE_HOUR";
    MuteDuration[MuteDuration["FOUR_HOURS"] = 14400] = "FOUR_HOURS";
    MuteDuration[MuteDuration["FOREVER"] = -1] = "FOREVER";
    MuteDuration["UNTIL_8AM"] = "until8AM";
})(exports.MuteDuration || (exports.MuteDuration = {}));
exports.MuteAction = void 0;
(function (MuteAction) {
    MuteAction[MuteAction["MUTE"] = 1] = "MUTE";
    MuteAction[MuteAction["UNMUTE"] = 3] = "UNMUTE";
})(exports.MuteAction || (exports.MuteAction = {}));
const setMuteFactory = utils.apiFactory()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.profile[0]}/api/social/profile/setmute`);
    /**
     * Set mute
     *
     * @param params - Mute parameters
     * @param threadID - ID of the thread to mute
     * @param type - Type of thread (User or Group)
     *
     * @throws {ZaloApiError}
     */
    return async function setMute(params = {}, threadID, type = Enum.ThreadType.User) {
        const { duration = exports.MuteDuration.FOREVER, action = exports.MuteAction.MUTE } = params;
        let muteDuration;
        if (action === exports.MuteAction.UNMUTE) {
            muteDuration = -1;
        }
        else if (duration === exports.MuteDuration.FOREVER) {
            muteDuration = -1;
        }
        else if (duration === exports.MuteDuration.UNTIL_8AM) {
            const now = new Date();
            const next8AM = new Date(now);
            next8AM.setHours(8, 0, 0, 0);
            if (now.getHours() >= 8) {
                next8AM.setDate(next8AM.getDate() + 1);
            }
            muteDuration = Math.floor((next8AM.getTime() - now.getTime()) / 1000);
        }
        else {
            muteDuration = duration;
        }
        const requestParams = {
            toid: threadID,
            duration: muteDuration,
            action: action,
            startTime: Math.floor(Date.now() / 1000),
            muteType: type === Enum.ThreadType.User ? 1 : 2,
            imei: ctx.imei,
        };
        const encryptedParams = utils.encodeAES(JSON.stringify(requestParams));
        if (!encryptedParams)
            throw new ZaloApiError.ZaloApiError("Failed to encrypt params");
        const response = await utils.request(serviceURL, {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });
        return utils.resolve(response);
    };
});

exports.setMuteFactory = setMuteFactory;
