'use strict';

var ZaloApiError = require('../Errors/ZaloApiError.cjs');
var Enum = require('../models/Enum.cjs');
require('../models/FriendEvent.cjs');
require('../models/GroupEvent.cjs');
require('../models/Reaction.cjs');
var utils = require('../utils.cjs');

const setMuteFactory = utils.apiFactory()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.profile[0]}/api/social/profile/setmute`);
    /**
     * Set mute
     *
     * @param params - Mute parameters
     * @param threadID - ID of the thread to mute
     * @param type - Type of thread (User or Group)
     *
     * @throws ZaloApiError
     */
    return async function setMute(params = {}, threadID, type = Enum.ThreadType.User) {
        const { duration = -1 /* MuteDuration.FOREVER */, action = 1 /* MuteAction.MUTE */ } = params;
        let muteDuration;
        if (action === 3 /* MuteAction.UNMUTE */) {
            muteDuration = -1;
        }
        else if (duration === -1 /* MuteDuration.FOREVER */) {
            muteDuration = -1;
        }
        else if (duration === "until8AM" /* MuteDuration.UNTIL_8AM */) {
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
