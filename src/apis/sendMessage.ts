import { appContext } from "../context.js";
import { API, Zalo } from "../index.js";
import { Message, MessageType } from "../models/Message.js";
import { decodeAES, encodeAES, logger, makeURL, request } from "../utils.js";

export function sendMessageFactory(api: API) {
    const directMessageServiceURL = makeURL(`${api.zpwServiceMap.chat[0]}/api/message`, {
        zpw_ver: Zalo.API_VERSION,
        zpw_type: Zalo.API_TYPE,
        nretry: 0,
    });
    const groupMessageServiceURL = makeURL(`${api.zpwServiceMap.group[0]}/api/group`, {
        zpw_ver: Zalo.API_VERSION,
        zpw_type: Zalo.API_TYPE,
        nretry: 0,
    });
    return async function sendMessage(
        message: string,
        recipientId: string,
        type: MessageType = MessageType.DirectMessage,
        quote?: Message
    ) {
        if (!appContext.secretKey) throw new Error("Secret key is not available");
        if (!appContext.imei) throw new Error("IMEI is not available");
        if (!appContext.cookie) throw new Error("Cookie is not available");
        if (!appContext.userAgent) throw new Error("User agent is not available");

        if (quote && !(quote instanceof Message)) throw new Error("Invalid quote message");
        const isGroupMessage = type == MessageType.GroupMessage;
        const quoteData = quote?.data;

        const params =
            quote && !isGroupMessage
                ? {
                      toid: isGroupMessage ? undefined : recipientId,
                      grid: isGroupMessage ? recipientId : undefined,
                      message: message,
                      clientId: Date.now(),
                      qmsgOwner: quoteData!.uidFrom,
                      qmsgId: quoteData!.msgId,
                      qmsgCliId: quoteData!.cliMsgId,
                      qmsgType: quoteData!.status,
                      qmsgTs: quoteData!.ts,
                      qmsg: quoteData!.content,
                      imei: appContext.imei,
                      qmsgTTL: quoteData!.ttl,
                      ttl: 0,
                  }
                : {
                      message: message,
                      clientId: Date.now(),
                      imei: appContext.imei,
                      ttl: 0,
                      toid: isGroupMessage ? undefined : recipientId,
                      grid: isGroupMessage ? recipientId : undefined,
                  };

        const encryptedParams = encodeAES(appContext.secretKey, JSON.stringify(params));
        if (!encryptedParams) throw new Error("Failed to encrypt message");
        const finalServiceUrl = new URL(
            isGroupMessage ? groupMessageServiceURL : directMessageServiceURL
        );
        if (quote) {
            if (isGroupMessage) {
                finalServiceUrl.pathname = finalServiceUrl.pathname + "/quote";
            } else {
                logger.warn(
                    "Quoting is not yet supported for group messages, falling back to normal message"
                );
                finalServiceUrl.pathname = finalServiceUrl.pathname + "/sendmsg";
            }
        } else {
            finalServiceUrl.pathname =
                finalServiceUrl.pathname + "/" + (isGroupMessage ? "sendmsg" : "sms");
        }

        const response = await request(finalServiceUrl.toString(), {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });

        if (!response.ok) throw new Error("Failed to send message: " + response.statusText);

        return decodeAES(appContext.secretKey, (await response.json()).data);
    };
}
