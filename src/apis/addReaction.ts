import { appContext } from "../context.js";
import { Message } from "../models/Message.js";
import { Reactions } from "../models/Reaction.js";
import { decodeAES, encodeAES, request } from "../utils.js";

export function addReactionFactory(serviceURL: string) {
    /**
     * Add reaction to a message
     *
     * @param icon Reaction icon
     * @param message Message object to react to
     */
    return async function addReaction(
        icon: Reactions,
        message: Message,
    ) {
        if (!appContext.secretKey) throw new Error("Secret key is not available");
        if (!appContext.imei) throw new Error("IMEI is not available");
        if (!appContext.cookie) throw new Error("Cookie is not available");
        if (!appContext.userAgent) throw new Error("User agent is not available");

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

        const encryptedParams = encodeAES(appContext.secretKey, JSON.stringify(params));
        if (!encryptedParams) throw new Error("Failed to encrypt message");

        const response = await request(serviceURL, {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });

        if (!response.ok) throw new Error("Failed to send message: " + response.statusText);

        return decodeAES(appContext.secretKey, (await response.json()).data);
    };
}
