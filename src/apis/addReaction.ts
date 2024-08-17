import { appContext } from "../context.js";
import { Message } from "../models/Message.js";
import { decodeAES, encodeAES, request } from "../utils.js";

export function addReactionFactory(serviceURL: string) {
    return async function addReaction(
        icon: ":>" | "/-strong" | "/-heart" | ":o" | ":-((" | ":-h" | "",
        message: Message,
    ) {
        if (!appContext.secretKey) throw new Error("Secret key is not available");
        if (!appContext.imei) throw new Error("IMEI is not available");
        if (!appContext.cookie) throw new Error("Cookie is not available");
        if (!appContext.userAgent) throw new Error("User agent is not available");

        let rType, source;

        switch (icon) {
            case ":>":
                rType = 0;
                source = 6;
                break;
            case "/-strong":
                rType = 3;
                source = 6;
                break;
            case "/-heart":
                rType = 5;
                source = 6;
                break;
            case ":o":
                rType = 32;
                source = 6;
                break;
            case ":-((":
                rType = 2;
                source = 6;
                break;
            case ":-h":
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
                                gMsgID: message.data.msgId,
                                cMsgID: message.data.ts,
                                msgType: 1,
                            },
                        ],
                        rIcon: icon,
                        rType,
                        source,
                    }),
                    clientId: message.data.cliMsgId,
                },
            ],
            toid: message.data.idTo,
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
