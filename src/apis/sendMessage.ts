import { appContext } from "../context.js";
import { API, Zalo } from "../index.js";
import { GroupMessage, Message, MessageType } from "../models/Message.js";
import { decodeAES, encodeAES, getClientMessageType, makeURL, request } from "../utils.js";

function prepareQMSGAttach(quote: Message | GroupMessage) {
    const quoteData = quote.data;
    if (typeof quoteData.content == "string") return quoteData.propertyExt;
    if (quoteData.msgType == "chat.todo")
        return {
            properties: {
                color: 0,
                size: 0,
                type: 0,
                subType: 0,
                ext: '{"shouldParseLinkOrContact":0}',
            },
        };

    return {
        ...quoteData.content,
        thumbUrl: quoteData.content.thumb,
        oriUrl: quoteData.content.href,
        normalUrl: quoteData.content.href,
    };
}

function prepareQMSG(quote: Message | GroupMessage) {
    const quoteData = quote.data;
    if (quoteData.msgType == "chat.todo" && typeof quoteData.content != "string") {
        return JSON.parse(quoteData.content.params).item.content;
    }

    return "";
}

export type Mention = {
    /**
     * mention position
     */
    pos: number;
    /**
     * id of the mentioned user
     */
    uid: string;
    /**
     * length of the mention
     */
    len: number;
};

export type MessageContent = {
    /**
     * Text content of the message
     */
    msg: string;
    /**
     * Quoted message (optional)
     */
    quote?: Message | GroupMessage;
    /**
     * Mentions in the message (optional)
     */
    mentions?: Mention[];
};

export function sendMessageFactory(api: API) {
    const serviceURLs = {
        [MessageType.DirectMessage]: makeURL(`${api.zpwServiceMap.chat[0]}/api/message`, {
            zpw_ver: Zalo.API_VERSION,
            zpw_type: Zalo.API_TYPE,
            nretry: 0,
        }),
        [MessageType.GroupMessage]: makeURL(`${api.zpwServiceMap.group[0]}/api/group`, {
            zpw_ver: Zalo.API_VERSION,
            zpw_type: Zalo.API_TYPE,
            nretry: 0,
        }),
    };
    /**
     * Send a message to a thread
     *
     * @param message Message content
     * @param threadId group or user id
     * @param type Message type (DirectMessage or GroupMessage)
     * @param quote Message or GroupMessage instance (optional), used for quoting
     */
    return async function sendMessage(
        message: MessageContent | string,
        threadId: string,
        type: MessageType = MessageType.DirectMessage,
    ) {
        if (!appContext.secretKey) throw new Error("Secret key is not available");
        if (!appContext.imei) throw new Error("IMEI is not available");
        if (!appContext.cookie) throw new Error("Cookie is not available");
        if (!appContext.userAgent) throw new Error("User agent is not available");

        if (!message) throw new Error("Missing message content");
        if (!threadId) throw new Error("Missing threadId");
        if (typeof message == "string") message = { msg: message };

        const { msg, mentions, quote } = message;

        if (!msg) throw new Error("Missing message content");

        const isValidInstance = quote instanceof Message || quote instanceof GroupMessage;
        if (quote && !isValidInstance) throw new Error("Invalid quote message");
        const isGroupMessage = type == MessageType.GroupMessage;

        const mentionsFinal =
            Array.isArray(mentions) && type == MessageType.GroupMessage
                ? mentions
                      .filter((m) => m.pos >= 0 && m.uid && m.len > 0)
                      .map((m) => ({
                          pos: m.pos,
                          uid: m.uid,
                          len: m.len,
                          type: m.uid == "-1" ? 1 : 0,
                      }))
                : [];

        const quoteData = quote?.data;
        if (quoteData) {
            if (typeof quoteData.content != "string" && quoteData.msgType == "webchat") {
                throw new Error("This kind of `webchat` quote type is not available");
            }

            if (quoteData.msgType == "group.poll") {
                throw new Error("The `group.poll` quote type is not available");
            }
        }

        const isMentionsValid = mentionsFinal.length > 0 && isGroupMessage;
        const params = quote
            ? {
                  toid: isGroupMessage ? undefined : threadId,
                  grid: isGroupMessage ? threadId : undefined,
                  message: msg,
                  clientId: Date.now(),
                  mentionInfo: isMentionsValid ? JSON.stringify(mentionsFinal) : undefined,
                  qmsgOwner: quoteData!.uidFrom,
                  qmsgId: quoteData!.msgId,
                  qmsgCliId: quoteData!.cliMsgId,
                  qmsgType: getClientMessageType(quoteData!.msgType),
                  qmsgTs: quoteData!.ts,
                  qmsg: typeof quoteData!.content == "string" ? quoteData!.content : prepareQMSG(quote),
                  imei: isGroupMessage ? undefined : appContext.imei,
                  visibility: isGroupMessage ? 0 : undefined,
                  qmsgAttach: isGroupMessage ? JSON.stringify(prepareQMSGAttach(quote)) : undefined,
                  qmsgTTL: quoteData!.ttl,
                  ttl: 0,
              }
            : {
                  message: msg,
                  clientId: Date.now(),
                  mentionInfo: isMentionsValid ? JSON.stringify(mentionsFinal) : undefined,
                  imei: isGroupMessage ? undefined : appContext.imei,
                  ttl: 0,
                  visibility: isGroupMessage ? 0 : undefined,
                  toid: isGroupMessage ? undefined : threadId,
                  grid: isGroupMessage ? threadId : undefined,
              };

        for (const key in params) {
            if (params[key as keyof typeof params] === undefined) delete params[key as keyof typeof params];
        }

        const encryptedParams = encodeAES(appContext.secretKey, JSON.stringify(params));
        if (!encryptedParams) throw new Error("Failed to encrypt message");
        const finalServiceUrl = new URL(serviceURLs[type]);
        if (quote) {
            finalServiceUrl.pathname = finalServiceUrl.pathname + "/quote";
        } else {
            finalServiceUrl.pathname =
                finalServiceUrl.pathname +
                "/" +
                (isGroupMessage ? (params.mentionInfo ? "mention" : "sendmsg") : "sms");
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
