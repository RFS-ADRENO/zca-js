import FormData from "form-data";
import fs from "fs";
import sharp from "sharp";
import { appContext } from "../context.js";
import { API, Zalo } from "../index.js";
import { GroupMessage, Message, MessageType } from "../models/Message.js";
import {
    decodeAES,
    encodeAES,
    getClientMessageType,
    getFileExtension,
    getFileName,
    getGifMetaData,
    getMd5LargeFileObject,
    makeURL,
    removeUndefinedKeys,
    request
} from "../utils.js";

const additionalCharacter = "a";

const attachmentUrlType = {
    image: "photo_original/send?",
    gif: "gif?",
    video: "asyncfile/msg?",
    others: "asyncfile/msg?",
};

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

async function send(data: SendType | SendType[], callback?: (data: any[]) => void): Promise<any[]> {
    if (!Array.isArray(data)) data = [data];

    let requests = [];
    let results: any = [];

    for (const d of data) {
        requests.push(
            request(d.url, {
                method: "POST",
                body: d.body,
                headers: d.headers,
            }).then(async (res) => {
                if (!res.ok) throw new Error("Failed to send message: " + res.statusText);

                let resDecode = decodeAES(appContext.secretKey!, (await res.json()).data);
                if (!resDecode) throw new Error("Failed to decode message");
                results.push(JSON.parse(resDecode));
            }),
        );
    }

    await Promise.all(requests);

    if (callback) callback(results);

    return results;
}

type SendType = {
    url: string;
    body?: BodyInit | null;
    headers?: Record<string, string>;
}

type UpthumbType = {
    hdUrl: string;
    clientFileId: string;
    url: string;
    fileId: string;
};

type AttachmentData =
    | {
        query?: Record<string, string>;
        fileType: "image" | "video" | "others";
        body: URLSearchParams;
        params: Record<string, any>;
    }
    | {
        query?: Record<string, string>;
        fileType: "gif";
        body: Buffer;
        headers: Record<string, string>;
    };

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
    /**
     * Attachments in the message (optional)
     */
    attachments?: string[];
};

export function sendMessageFactory(api: API) {
    const serviceURLs = {
        message: {
            [MessageType.DirectMessage]: makeURL(`${api.zpwServiceMap.chat[0]}/api/message`, {
                zpw_ver: Zalo.API_VERSION,
                zpw_type: Zalo.API_TYPE,
                nretry: 0,
            }),
            [MessageType.GroupMessage]: makeURL(`${api.zpwServiceMap.group[0]}/api/group`, {
                zpw_ver: Zalo.API_VERSION,
                zpw_type: Zalo.API_TYPE,
                nretry: 0,
            })
        },
        attachment: {
            [MessageType.DirectMessage]: `${api.zpwServiceMap.file[0]}/api/message/`,
            [MessageType.GroupMessage]: `${api.zpwServiceMap.file[0]}/api/group/`
        }
    };

    function getGroupLayoutId() {
        return Date.now();
    }

    async function upthumb(filePath: string, url: string): Promise<UpthumbType> {
        let formData = new FormData();
        let buffer = await sharp(filePath).png().toBuffer();
        formData.append("fileContent", buffer, {
            filename: "blob",
            contentType: "image/png",
        });

        const params = {
            clientId: Date.now(),
            imei: appContext.imei,
        };

        const encryptedParams = encodeAES(appContext.secretKey!, JSON.stringify(params));
        if (!encryptedParams) throw new Error("Failed to encrypt message");

        let response = await request(
            makeURL(url + "upthumb?", {
                zpw_ver: Zalo.API_VERSION,
                zpw_type: Zalo.API_TYPE,
                params: encryptedParams,
            }),
            {
                method: "POST",
                headers: formData.getHeaders(),
                body: formData.getBuffer(),
            },
        );

        if (!response.ok) throw new Error("Failed to upload thumbnail: " + response.statusText);
        let resDecode = decodeAES(appContext.secretKey!, (await response.json()).data);
        if (!resDecode) throw new Error("Failed to decode thumbnail");
        if (!JSON.parse(resDecode).data) {
            throw new Error("Failed to upload file");
        }

        return JSON.parse(resDecode).data as UpthumbType;
    }

    function handleMentions(type: MessageType, msg: string, mentions?: Mention[]) {
        let totalMentionChars = 0;
        let mentionsFinal = Array.isArray(mentions) && type == MessageType.GroupMessage
            ? mentions
                .filter((m) => m.pos >= 0 && m.uid && m.len > 0)
                .map((m) => {
                    totalMentionChars += m.len;
                    return {
                        pos: m.pos,
                        uid: m.uid,
                        len: m.len,
                        type: m.uid == "-1" ? 1 : 0,
                    };
                })
            : [];

        if (totalMentionChars > msg.length) {
            msg += additionalCharacter.repeat(totalMentionChars - msg.length);
        }

        return {
            mentionsFinal,
            msgFinal: msg,
        };
    }

    async function handleMessage({ msg, mentions, quote }: MessageContent, threadId: string, type: MessageType) {
        if (!msg || msg.length == 0) throw new Error("Missing message content");
        const isValidInstance = quote instanceof Message || quote instanceof GroupMessage;
        if (quote && !isValidInstance) throw new Error("Invalid quote message");
        const isGroupMessage = type == MessageType.GroupMessage;

        const { mentionsFinal, msgFinal } = handleMentions(type, msg, mentions);
        msg = msgFinal;

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

        const encryptedParams = encodeAES(appContext.secretKey!, JSON.stringify(params));
        if (!encryptedParams) throw new Error("Failed to encrypt message");
        const finalServiceUrl = new URL(serviceURLs.message[type]);
        if (quote) {
            finalServiceUrl.pathname = finalServiceUrl.pathname + "/quote";
        } else {
            finalServiceUrl.pathname =
                finalServiceUrl.pathname +
                "/" +
                (isGroupMessage ? (params.mentionInfo ? "mention" : "sendmsg") : "sms");
        }

        return {
            url: finalServiceUrl.toString(),
            body: new URLSearchParams({ params: encryptedParams }),
        }
    }

    async function handleAttachment({ msg, attachments, mentions, quote }: MessageContent, threadId: string, type: MessageType) {
        if (!attachments || attachments.length == 0) throw new Error("Missing attachments");

        const firstExtFile = getFileExtension(attachments[0]);
        const isSingleFile = attachments.length == 1;
        const isGroupMessage = type == MessageType.GroupMessage;

        const canBeDesc = isSingleFile && ["jpg", "jpeg", "png", "webp"].includes(firstExtFile);

        const gifFiles = attachments.filter((e) => getFileExtension(e) == "gif");
        attachments = attachments.filter((e) => getFileExtension(e) != "gif");

        const uploadAttachment = await api.uploadAttachment(attachments, threadId, type);

        const attachmentsData: AttachmentData[] = [];
        let indexInGroupLayout = uploadAttachment.length - 1;

        const groupLayoutId = getGroupLayoutId();

        const { mentionsFinal, msgFinal } = handleMentions(type, msg, mentions);
        msg = msgFinal;

        const isMentionsValid = mentionsFinal.length > 0 && isGroupMessage && attachments.length == 1;

        const isMultiFile = attachments.length > 1;
        let clientId = Date.now();
        for (const attachment of uploadAttachment) {
            let data: AttachmentData;
            switch (attachment.fileType) {
                case "image": {
                    data = {
                        fileType: attachment.fileType,
                        params: {
                            photoId: attachment.photoId,
                            clientId: (clientId++).toString(),
                            desc: msg,
                            width: attachment.width,
                            height: attachment.height,
                            toid: isGroupMessage ? undefined : String(threadId),
                            grid: isGroupMessage ? String(threadId) : undefined,
                            rawUrl: attachment.normalUrl,
                            hdUrl: attachment.hdUrl,
                            thumbUrl: attachment.thumbUrl,
                            oriUrl: isGroupMessage ? attachment.normalUrl : undefined,
                            normalUrl: isGroupMessage ? undefined : attachment.normalUrl,
                            hdSize: String(attachment.totalSize),
                            zsource: -1,
                            ttl: 0,
                            jcp: "{\"convertible\":\"jxl\"}",

                            groupLayoutId: isMultiFile ? groupLayoutId : undefined,
                            isGroupLayout: isMultiFile ? 1 : undefined,
                            idInGroup: isMultiFile ? indexInGroupLayout-- : undefined,
                            totalItemInGroup: isMultiFile ? uploadAttachment.length : undefined,

                            mentionInfo: isMentionsValid && canBeDesc && !quote ? JSON.stringify(mentionsFinal) : undefined,
                        },
                        body: new URLSearchParams(),
                    };
                    break;
                }

                case "video": {
                    data = {
                        fileType: attachment.fileType,
                        params: {
                            fileId: attachment.fileId,
                            checksum: attachment.checksum,
                            checksumSha: "",
                            extention: getFileExtension(attachment.fileName),
                            totalSize: attachment.totalSize,
                            fileName: attachment.fileName,
                            clientId: attachment.clientFileId,
                            fType: 1,
                            fileCount: 0,
                            fdata: "{}",
                            toid: isGroupMessage ? undefined : String(threadId),
                            grid: isGroupMessage ? String(threadId) : undefined,
                            fileUrl: attachment.fileUrl,
                            zsource: -1,
                            ttl: 0,
                        },
                        body: new URLSearchParams(),
                    };
                    break;
                }

                case "others": {
                    data = {
                        fileType: attachment.fileType,
                        params: {
                            fileId: attachment.fileId,
                            checksum: attachment.checksum,
                            checksumSha: "",
                            extention: getFileExtension(attachment.fileName),
                            totalSize: attachment.totalSize,
                            fileName: attachment.fileName,
                            clientId: attachment.clientFileId,
                            fType: 1,
                            fileCount: 0,
                            fdata: "{}",
                            toid: isGroupMessage ? undefined : String(threadId),
                            grid: isGroupMessage ? String(threadId) : undefined,
                            fileUrl: attachment.fileUrl,
                            zsource: -1,
                            ttl: 0,
                        },
                        body: new URLSearchParams(),
                    };
                    break;
                }
            }

            removeUndefinedKeys(data.params);
            const encryptedParams = encodeAES(appContext.secretKey!, JSON.stringify(data.params));
            if (!encryptedParams) throw new Error("Failed to encrypt message");

            data.body.append("params", encryptedParams);
            attachmentsData.push(data);
        }

        for (const gif of gifFiles) {
            const _upthumb = await upthumb(gif, serviceURLs.attachment[MessageType.DirectMessage]);
            const gifData = await getGifMetaData(gif);

            const formData = new FormData();
            formData.append("chunkContent", await fs.promises.readFile(gif), {
                filename: getFileName(gif),
                contentType: "application/octet-stream",
            });

            const params = {
                clientId: Date.now().toString(),
                fileName: gifData.fileName,
                totalSize: gifData.totalSize,
                width: gifData.width,
                height: gifData.height,
                msg: msg,
                type: 1,
                ttl: 0,
                visibility: isGroupMessage ? 0 : undefined,
                toid: isGroupMessage ? undefined : threadId,
                grid: isGroupMessage ? threadId : undefined,
                thumb: _upthumb.url,
                checksum: (await getMd5LargeFileObject(gif, gifData.totalSize!)).data,
                totalChunk: 1,
                chunkId: 1,
            };

            removeUndefinedKeys(params);
            const encryptedParams = encodeAES(appContext.secretKey!, JSON.stringify(params));
            if (!encryptedParams) throw new Error("Failed to encrypt message");

            attachmentsData.push({
                query: {
                    params: encryptedParams,
                    type: "1",
                },
                body: formData.getBuffer(),
                headers: formData.getHeaders(),
                fileType: "gif",
            });
        }

        let responses = [];

        for (const data of attachmentsData) {
            responses.push({
                url: makeURL(
                    serviceURLs.attachment[type] + attachmentUrlType[data.fileType],
                    Object.assign(
                        {
                            zpw_ver: Zalo.API_VERSION,
                            zpw_type: Zalo.API_TYPE,
                            nretry: "0",
                        },
                        data.query || {},
                    ),
                ),
                body: data.body,
                headers: data.fileType == "gif" ? data.headers : {},
            })
        }

        return responses;
    }

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

        let { msg, quote, attachments, mentions } = message;

        if (!msg && (!attachments || attachments && attachments.length == 0)) throw new Error("Missing message content");

        let responses: {
            message: any | null;
            attachment: any[];
        } = {
            message: null,
            attachment: [],
        };

        if (attachments && attachments.length > 0) {
            const firstExtFile = getFileExtension(attachments[0]);
            const isSingleFile = attachments.length == 1;

            const canBeDesc = isSingleFile && ["jpg", "jpeg", "png", "webp"].includes(firstExtFile);
            if (!canBeDesc && msg.length > 0 || msg.length > 0 && quote) {
                await handleMessage(message, threadId, type).then(async (data) => {
                    await send(data, (res) => responses.message = res[0]);
                });
                msg = "";
                mentions = undefined;
            }
            await handleAttachment({ msg, mentions, attachments, quote }, threadId, type).then(async (data) => {
                await send(data, (res) => responses.attachment = res);
            });
        }

        if (msg.length > 0) {
            await handleMessage(message, threadId, type).then(async (data) => {
                await send(data, (res) => responses.message = res[0]);
            });
        }

        return responses;
    };
}
