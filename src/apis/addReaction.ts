import { appContext } from "../context.js";
import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { Message } from "../models/Message.js";
import { Reactions } from "../models/Reaction.js";
import { encodeAES, handleZaloResponse, request } from "../utils.js";

export type AddReactionResponse = {
    msgIds: string;
};

export function addReactionFactory(serviceURL: string) {
    /**
     * Add reaction to a message
     *
     * @param icon Reaction icon
     * @param message Message object to react to
     *
     * @throws ZaloApiError
     */
    return async function addReaction(icon: Reactions, message: Message) {
        if (!appContext.secretKey) throw new ZaloApiError("Secret key is not available");
        if (!appContext.imei) throw new ZaloApiError("IMEI is not available");
        if (!appContext.cookie) throw new ZaloApiError("Cookie is not available");
        if (!appContext.userAgent) throw new ZaloApiError("User agent is not available");

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
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt message");

        const response = await request(serviceURL, {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });

        const result = await handleZaloResponse<AddReactionResponse>(response);
        if (result.error) throw new ZaloApiError(result.error.message, result.error.code);

        return result.data as AddReactionResponse;
    };
}
