'use strict';

var ZaloApiError = require('../Errors/ZaloApiError.cjs');
var Enum = require('../models/Enum.cjs');
var Reaction = require('../models/Reaction.cjs');
var utils = require('../utils.cjs');

const addReactionFactory = utils.apiFactory()((api, ctx, utils) => {
    const serviceURLs = {
        [Enum.ThreadType.User]: utils.makeURL(`${api.zpwServiceMap.reaction[0]}/api/message/reaction`),
        [Enum.ThreadType.Group]: utils.makeURL(`${api.zpwServiceMap.reaction[0]}/api/group/reaction`),
    };
    /**
     * Add reaction to a message
     *
     * @param icon Reaction icon
     * @param message Message object to react to
     *
     * @throws ZaloApiError
     */
    return async function addReaction(icon, message, type = Enum.ThreadType.User) {
        const serviceURL = serviceURLs[message.type];
        let rType, source;
        if (typeof icon == "object") {
            rType = icon.rType;
            source = icon.source;
        }
        else
            switch (icon) {
                case Reaction.Reactions.HAHA:
                    rType = 0;
                    source = 6;
                    break;
                case Reaction.Reactions.LIKE:
                    rType = 3;
                    source = 6;
                    break;
                case Reaction.Reactions.HEART:
                    rType = 5;
                    source = 6;
                    break;
                case Reaction.Reactions.WOW:
                    rType = 32;
                    source = 6;
                    break;
                case Reaction.Reactions.CRY:
                    rType = 2;
                    source = 6;
                    break;
                case Reaction.Reactions.ANGRY:
                    rType = 20;
                    source = 6;
                    break;
                case Reaction.Reactions.KISS:
                    rType = 8;
                    source = 6;
                    break;
                case Reaction.Reactions.TEARS_OF_JOY:
                    rType = 7;
                    source = 6;
                    break;
                case Reaction.Reactions.SHIT:
                    rType = 66;
                    source = 6;
                    break;
                case Reaction.Reactions.ROSE:
                    rType = 120;
                    source = 6;
                    break;
                case Reaction.Reactions.BROKEN_HEART:
                    rType = 65;
                    source = 6;
                    break;
                case Reaction.Reactions.DISLIKE:
                    rType = 4;
                    source = 6;
                    break;
                case Reaction.Reactions.LOVE:
                    rType = 29;
                    source = 6;
                    break;
                case Reaction.Reactions.CONFUSED:
                    rType = 51;
                    source = 6;
                    break;
                case Reaction.Reactions.WINK:
                    rType = 45;
                    source = 6;
                    break;
                case Reaction.Reactions.FADE:
                    rType = 121;
                    source = 6;
                    break;
                case Reaction.Reactions.SUN:
                    rType = 67;
                    source = 6;
                    break;
                case Reaction.Reactions.BIRTHDAY:
                    rType = 126;
                    source = 6;
                    break;
                case Reaction.Reactions.BOMB:
                    rType = 127;
                    source = 6;
                    break;
                case Reaction.Reactions.OK:
                    rType = 68;
                    source = 6;
                    break;
                case Reaction.Reactions.PEACE:
                    rType = 69;
                    source = 6;
                    break;
                case Reaction.Reactions.THANKS:
                    rType = 70;
                    source = 6;
                    break;
                case Reaction.Reactions.PUNCH:
                    rType = 71;
                    source = 6;
                    break;
                case Reaction.Reactions.SHARE:
                    rType = 72;
                    source = 6;
                    break;
                case Reaction.Reactions.PRAY:
                    rType = 73;
                    source = 6;
                    break;
                case Reaction.Reactions.NO:
                    rType = 131;
                    source = 6;
                    break;
                case Reaction.Reactions.BAD:
                    rType = 132;
                    source = 6;
                    break;
                case Reaction.Reactions.LOVE_YOU:
                    rType = 133;
                    source = 6;
                    break;
                case Reaction.Reactions.SAD:
                    rType = 1;
                    source = 6;
                    break;
                case Reaction.Reactions.VERY_SAD:
                    rType = 16;
                    source = 6;
                    break;
                case Reaction.Reactions.COOL:
                    rType = 21;
                    source = 6;
                    break;
                case Reaction.Reactions.NERD:
                    rType = 22;
                    source = 6;
                    break;
                case Reaction.Reactions.BIG_SMILE:
                    rType = 23;
                    source = 6;
                    break;
                case Reaction.Reactions.SUNGLASSES:
                    rType = 26;
                    source = 6;
                    break;
                case Reaction.Reactions.NEUTRAL:
                    rType = 30;
                    source = 6;
                    break;
                case Reaction.Reactions.SAD_FACE:
                    rType = 35;
                    source = 6;
                    break;
                case Reaction.Reactions.BYE:
                    rType = 36;
                    source = 6;
                    break;
                case Reaction.Reactions.SLEEPY:
                    rType = 38;
                    source = 6;
                    break;
                case Reaction.Reactions.WIPE:
                    rType = 39;
                    source = 6;
                    break;
                case Reaction.Reactions.DIG:
                    rType = 42;
                    source = 6;
                    break;
                case Reaction.Reactions.ANGUISH:
                    rType = 44;
                    source = 6;
                    break;
                case Reaction.Reactions.HANDCLAP:
                    rType = 46;
                    source = 6;
                    break;
                case Reaction.Reactions.ANGRY_FACE:
                    rType = 47;
                    source = 6;
                    break;
                case Reaction.Reactions.F_CHAIR:
                    rType = 48;
                    source = 6;
                    break;
                case Reaction.Reactions.L_CHAIR:
                    rType = 49;
                    source = 6;
                    break;
                case Reaction.Reactions.R_CHAIR:
                    rType = 50;
                    source = 6;
                    break;
                case Reaction.Reactions.SILENT:
                    rType = 52;
                    source = 6;
                    break;
                case Reaction.Reactions.SURPRISE:
                    rType = 53;
                    source = 6;
                    break;
                case Reaction.Reactions.EMBARRASSED:
                    rType = 54;
                    source = 6;
                    break;
                case Reaction.Reactions.AFRAID:
                    rType = 60;
                    source = 6;
                    break;
                case Reaction.Reactions.SAD2:
                    rType = 61;
                    source = 6;
                    break;
                case Reaction.Reactions.BIG_LAUGH:
                    rType = 62;
                    source = 6;
                    break;
                case Reaction.Reactions.RICH:
                    rType = 63;
                    source = 6;
                    break;
                case Reaction.Reactions.BEER:
                    rType = 99;
                    source = 6;
                    break;
                default:
                    rType = -1;
                    source = 6;
            }
        const rIcon = typeof icon == "object" ? icon.icon : icon;
        if (rType == undefined || source == undefined || rIcon == undefined) {
            throw new ZaloApiError.ZaloApiError("Invalid reaction");
        }
        const params = {
            react_list: [
                {
                    message: JSON.stringify({
                        rMsg: [
                            {
                                gMsgID: parseInt(message.data.msgId),
                                cMsgID: parseInt(message.data.cliMsgId),
                                msgType: 1,
                            },
                        ],
                        rIcon,
                        rType,
                        source,
                    }),
                    clientId: Date.now(),
                },
            ],
        };
        if (type == Enum.ThreadType.User) {
            params.toid = message.threadId;
        }
        else {
            params.grid = message.threadId;
            params.imei = ctx.imei;
        }
        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams)
            throw new ZaloApiError.ZaloApiError("Failed to encrypt message");
        const response = await utils.request(serviceURL, {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });
        return utils.resolve(response);
    };
});

exports.addReactionFactory = addReactionFactory;
