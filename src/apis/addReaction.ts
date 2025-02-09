import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { UserMessage } from "../models/Message.js";
import { Reactions } from "../models/Reaction.js";
import { apiFactory } from "../utils.js";

export type AddReactionResponse = {
    msgIds: string;
};

export const addReactionFactory = apiFactory<AddReactionResponse>()((api, _, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.reaction[0]}/api/message/reaction`);

    /**
     * Add reaction to a message
     *
     * @param icon Reaction icon
     * @param message Message object to react to
     *
     * @throws ZaloApiError
     */
    return async function addReaction(icon: Reactions, message: UserMessage) {
        let rType, source;

        switch (icon) {
            case Reactions.HAHA:
                rType = 0;
                source = 6;
                break;
            case Reactions.LIKE:
                rType = 3;
                source = 6;
                break;
            case Reactions.HEART:
                rType = 5;
                source = 6;
                break;
            case Reactions.WOW:
                rType = 32;
                source = 6;
                break;
            case Reactions.CRY:
                rType = 2;
                source = 6;
                break;
            case Reactions.ANGRY:
                rType = 20;
                source = 6;
                break;
            case Reactions.KISS:
                rType = 8;
                source = 6;
                break;
            case Reactions.TEARS_OF_JOY:
                rType = 7;
                source = 6;
                break;
            case Reactions.SHIT:
                rType = 66;
                source = 6;
                break;
            case Reactions.ROSE:
                rType = 120;
                source = 6;
                break;
            case Reactions.BROKEN_HEART:
                rType = 65;
                source = 6;
                break;
            case Reactions.DISLIKE:
                rType = 4;
                source = 6;
                break;
            case Reactions.LOVE:
                rType = 29;
                source = 6;
                break;
            case Reactions.CONFUSED:
                rType = 51;
                source = 6;
                break;
            case Reactions.WINK:
                rType = 45;
                source = 6;
                break;
            case Reactions.FADE:
                rType = 121;
                source = 6;
                break;
            case Reactions.SUN:
                rType = 67;
                source = 6;
                break;
            case Reactions.BIRTHDAY:
                rType = 126;
                source = 6;
                break;
            case Reactions.BOMB:
                rType = 127;
                source = 6;
                break;
            case Reactions.OK:
                rType = 68;
                source = 6;
                break;
            case Reactions.PEACE:
                rType = 69;
                source = 6;
                break;
            case Reactions.THANKS:
                rType = 70;
                source = 6;
                break;
            case Reactions.PUNCH:
                rType = 71;
                source = 6;
                break;
            case Reactions.SHARE:
                rType = 72;
                source = 6;
                break;
            case Reactions.PRAY:
                rType = 73;
                source = 6;
                break;
            case Reactions.NO:
                rType = 131;
                source = 6;
                break;
            case Reactions.BAD:
                rType = 132;
                source = 6;
                break;
            case Reactions.LOVE_YOU:
                rType = 133;
                source = 6;
                break;
            case Reactions.SAD:
                rType = 1;
                source = 6;
                break;
            case Reactions.VERY_SAD:
                rType = 16;
                source = 6;
                break;
            case Reactions.COOL:
                rType = 21;
                source = 6;
                break;
            case Reactions.NERD:
                rType = 22;
                source = 6;
                break;
            case Reactions.BIG_SMILE:
                rType = 23;
                source = 6;
                break;
            case Reactions.SUNGLASSES:
                rType = 26;
                source = 6;
                break;
            case Reactions.NEUTRAL:
                rType = 30;
                source = 6;
                break;
            case Reactions.SAD_FACE:
                rType = 35;
                source = 6;
                break;
            case Reactions.BYE:
                rType = 36;
                source = 6;
                break;
            case Reactions.SLEEPY:
                rType = 38;
                source = 6;
                break;
            case Reactions.WIPE:
                rType = 39;
                source = 6;
                break;
            case Reactions.DIG:
                rType = 42;
                source = 6;
                break;
            case Reactions.ANGUISH:
                rType = 44;
                source = 6;
                break;
            case Reactions.HANDCLAP:
                rType = 46;
                source = 6;
                break;
            case Reactions.ANGRY_FACE:
                rType = 47;
                source = 6;
                break;
            case Reactions.F_CHAIR:
                rType = 48;
                source = 6;
                break;
            case Reactions.L_CHAIR:
                rType = 49;
                source = 6;
                break;
            case Reactions.R_CHAIR:
                rType = 50;
                source = 6;
                break;
            case Reactions.SILENT:
                rType = 52;
                source = 6;
                break;
            case Reactions.SURPRISE:
                rType = 53;
                source = 6;
                break;
            case Reactions.EMBARRASSED:
                rType = 54;
                source = 6;
                break;
            case Reactions.AFRAID:
                rType = 60;
                source = 6;
                break;
            case Reactions.SAD2:
                rType = 61;
                source = 6;
                break;
            case Reactions.BIG_LAUGH:
                rType = 62;
                source = 6;
                break;
            case Reactions.RICH:
                rType = 63;
                source = 6;
                break;
            case Reactions.BEER:
                rType = 99;
                source = 6;
                break;
            default:
                rType = -1;
                source = 6;
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
                        rIcon: icon,
                        rType,
                        source,
                    }),
                    clientId: Date.now(),
                },
            ],
            toid: message.threadId,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt message");

        const response = await utils.request(serviceURL, {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });

        return utils.resolve(response);
    };
});
