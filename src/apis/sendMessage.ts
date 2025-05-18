import FormData from "form-data";
import fs from "node:fs/promises";
import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { ThreadType, type TMessage } from "../models/index.js";
import {
    apiFactory,
    getClientMessageType,
    getFileExtension,
    getFileName,
    getGifMetaData,
    getMd5LargeFileObject,
    removeUndefinedKeys,
    resolveResponse,
} from "../utils.js";
import type { AttachmentSource } from "../models/Attachment.js";

export type SendMessageResult = {
    msgId: number;
};

export type SendMessageResponse = {
    message: SendMessageResult | null;
    attachment: SendMessageResult[];
};

export type SendMessageQuote = {
    content: TMessage["content"];
    msgType: TMessage["msgType"];
    propertyExt: TMessage["propertyExt"];

    uidFrom: TMessage["uidFrom"];
    msgId: TMessage["msgId"];
    cliMsgId: TMessage["cliMsgId"];
    ts: TMessage["ts"];
    ttl: TMessage["ttl"];
};

const attachmentUrlType = {
    image: "photo_original/send?",
    gif: "gif?",
    video: "asyncfile/msg?",
    others: "asyncfile/msg?",
};

function prepareQMSGAttach(quote: SendMessageQuote) {
    const quoteData = quote;
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

function prepareQMSG(quote: SendMessageQuote) {
    const quoteData = quote;
    if (quoteData.msgType == "chat.todo" && typeof quoteData.content != "string") {
        return JSON.parse(quoteData.content.params).item.content;
    }

    return "";
}

type SendType = {
    url: string;
    body?: BodyInit | null;
    headers?: Record<string, string>;
};

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

export enum TextStyle {
    Bold = "b",
    Italic = "i",
    Underline = "u",
    StrikeThrough = "s",
    Red = "c_db342e",
    Orange = "c_f27806",
    Yellow = "c_f7b503",
    Green = "c_15a85f",
    Small = "f_13",
    Big = "f_18",
    UnorderedList = "lst_1",
    OrderedList = "lst_2",
    Indent = "ind_$",
}

export type Style =
    | {
          start: number;
          len: number;
          st: Exclude<TextStyle, TextStyle.Indent>;
      }
    | {
          start: number;
          len: number;
          st: TextStyle.Indent;
          /**
           * Number of spaces used for indentation.
           */
          indentSize?: number;
      };

export enum Urgency {
    Default,
    Important,
    Urgent,
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
     * Text styles
     */
    styles?: Style[];
    /**
     * Urgency of the message
     */
    urgency?: Urgency;
    /**
     * Quoted message (optional)
     */
    quote?: SendMessageQuote;
    /**
     * Mentions in the message (optional)
     */
    mentions?: Mention[];
    /**
     * Attachments in the message (optional)
     */
    attachments?: AttachmentSource[];
    /**
     * Time to live in milisecond
     */
    ttl?: number;
};

export const sendMessageFactory = apiFactory()((api, ctx, utils) => {
    const serviceURLs = {
        message: {
            [ThreadType.User]: utils.makeURL(`${api.zpwServiceMap.chat[0]}/api/message`, {
                nretry: 0,
            }),
            [ThreadType.Group]: utils.makeURL(`${api.zpwServiceMap.group[0]}/api/group`, {
                nretry: 0,
            }),
        },
        attachment: {
            [ThreadType.User]: `${api.zpwServiceMap.file[0]}/api/message/`,
            [ThreadType.Group]: `${api.zpwServiceMap.file[0]}/api/group/`,
        },
    };

    const { sharefile } = ctx.settings!.features;

    function isExceedMaxFile(totalFile: number) {
        return totalFile > sharefile.max_file;
    }

    function isExceedMaxFileSize(fileSize: number) {
        return fileSize > sharefile.max_size_share_file_v3 * 1024 * 1024;
    }

    function getGroupLayoutId() {
        return Date.now();
    }

    async function send(data: SendType | SendType[]): Promise<SendMessageResult[]> {
        if (!Array.isArray(data)) data = [data];

        const requests: Promise<SendMessageResult>[] = [];

        for (const each of data) {
            requests.push(
                (async () => {
                    const response = await utils.request(each.url, {
                        method: "POST",
                        body: each.body,
                        headers: each.headers,
                    });

                    return await resolveResponse<SendMessageResult>(ctx, response);
                })(),
            );
        }

        return await Promise.all(requests);
    }

    async function upthumb(source: AttachmentSource, url: string): Promise<UpthumbType> {
        let formData = new FormData();
        let buffer = typeof source == "string" ? await fs.readFile(source) : source.data;
        formData.append("fileContent", buffer, {
            filename: "blob",
            contentType: "image/png",
        });

        const params = {
            clientId: Date.now(),
            imei: ctx.imei,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt message");

        const response = await utils.request(
            utils.makeURL(url + "upthumb?", {
                params: encryptedParams,
            }),
            {
                method: "POST",
                headers: formData.getHeaders(),
                body: formData.getBuffer(),
            },
        );

        return await resolveResponse<UpthumbType>(ctx, response);
    }

    function handleMentions(type: ThreadType, msg: string, mentions?: Mention[]) {
        let totalMentionLen = 0;
        const mentionsFinal =
            Array.isArray(mentions) && type == ThreadType.Group
                ? mentions
                      .filter((m) => m.pos >= 0 && m.uid && m.len > 0)
                      .map((m) => {
                          totalMentionLen += m.len;
                          return {
                              pos: m.pos,
                              uid: m.uid,
                              len: m.len,
                              type: m.uid == "-1" ? 1 : 0,
                          };
                      })
                : [];

        if (totalMentionLen > msg.length) {
            throw new ZaloApiError("Invalid mentions: total mention characters exceed message length");
        }

        return {
            mentionsFinal,
            msgFinal: msg,
        };
    }

    function handleStyles(params: Record<any, any>, styles?: Style[]) {
        if (styles)
            Object.assign(params, {
                textProperties: JSON.stringify({
                    styles: styles.map((e) => {
                        const styleFinal = {
                            ...e,
                            indentSize: undefined,
                            st:
                                e.st == TextStyle.Indent
                                    ? TextStyle.Indent.replace("$", `${e.indentSize ?? 1}0`)
                                    : e.st,
                        };

                        removeUndefinedKeys(styleFinal);
                        return styleFinal;
                    }),
                    ver: 0,
                }),
            });
    }

    function handleUrgency(params: Record<any, any>, urgency?: Urgency) {
        if (urgency == Urgency.Important || urgency == Urgency.Urgent) {
            Object.assign(params, { metaData: { urgency } });
        }
    }

    async function handleMessage(
        { msg, styles, urgency, mentions, quote, ttl }: MessageContent,
        threadId: string,
        type: ThreadType,
    ) {
        if (!msg || msg.length == 0) throw new ZaloApiError("Missing message content");
        const isGroupMessage = type == ThreadType.Group;

        const { mentionsFinal, msgFinal } = handleMentions(type, msg, mentions);
        msg = msgFinal;

        if (quote) {
            if (typeof quote.content != "string" && quote.msgType == "webchat") {
                throw new ZaloApiError("This kind of `webchat` quote type is not available");
            }

            if (quote.msgType == "group.poll") {
                throw new ZaloApiError("The `group.poll` quote type is not available");
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
                  qmsgOwner: quote.uidFrom,
                  qmsgId: quote.msgId,
                  qmsgCliId: quote.cliMsgId,
                  qmsgType: getClientMessageType(quote.msgType),
                  qmsgTs: quote.ts,
                  qmsg: typeof quote.content == "string" ? quote.content : prepareQMSG(quote),
                  imei: isGroupMessage ? undefined : ctx.imei,
                  visibility: isGroupMessage ? 0 : undefined,
                  qmsgAttach: isGroupMessage ? JSON.stringify(prepareQMSGAttach(quote)) : undefined,
                  qmsgTTL: quote.ttl,
                  ttl: ttl ?? 0,
              }
            : {
                  message: msg,
                  clientId: Date.now(),
                  mentionInfo: isMentionsValid ? JSON.stringify(mentionsFinal) : undefined,
                  imei: isGroupMessage ? undefined : ctx.imei,
                  ttl: ttl ?? 0,
                  visibility: isGroupMessage ? 0 : undefined,
                  toid: isGroupMessage ? undefined : threadId,
                  grid: isGroupMessage ? threadId : undefined,
              };

        handleStyles(params, styles);
        handleUrgency(params, urgency);

        removeUndefinedKeys(params);

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt message");
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
        };
    }

    async function handleAttachment(
        { msg, attachments, mentions, quote, ttl, urgency }: MessageContent,
        threadId: string,
        type: ThreadType,
    ) {
        if (!attachments || attachments.length == 0) throw new ZaloApiError("Missing attachments");
        const firstSource = attachments[0];
        const isFilePath = typeof firstSource == "string";

        const firstExtFile = getFileExtension(isFilePath ? firstSource : firstSource.filename);
        const isSingleFile = attachments.length == 1;
        const isGroupMessage = type == ThreadType.Group;

        const canBeDesc = isSingleFile && ["jpg", "jpeg", "png", "webp"].includes(firstExtFile);

        const gifFiles = attachments.filter((e) => getFileExtension(typeof e == "string" ? e : e.filename) == "gif");
        attachments = attachments.filter((e) => getFileExtension(typeof e == "string" ? e : e.filename) != "gif");

        const uploadAttachment = attachments.length == 0 ? [] : await api.uploadAttachment(attachments, threadId, type);

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
                            ttl: ttl ?? 0,
                            jcp: '{"convertible":"jxl"}',

                            groupLayoutId: isMultiFile ? groupLayoutId : undefined,
                            isGroupLayout: isMultiFile ? 1 : undefined,
                            idInGroup: isMultiFile ? indexInGroupLayout-- : undefined,
                            totalItemInGroup: isMultiFile ? uploadAttachment.length : undefined,

                            mentionInfo:
                                isMentionsValid && canBeDesc && !quote ? JSON.stringify(mentionsFinal) : undefined,
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
                            ttl: ttl ?? 0,
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
                            ttl: ttl ?? 0,
                        },
                        body: new URLSearchParams(),
                    };
                    break;
                }
            }

            handleUrgency(data.params, urgency);

            removeUndefinedKeys(data.params);
            const encryptedParams = utils.encodeAES(JSON.stringify(data.params));
            if (!encryptedParams) throw new ZaloApiError("Failed to encrypt message");

            data.body.append("params", encryptedParams);
            attachmentsData.push(data);
        }

        for (const gif of gifFiles) {
            const isFilePath = typeof gif == "string";
            const gifData = isFilePath ? await getGifMetaData(gif) : { ...gif.metadata, fileName: gif.filename };
            if (isExceedMaxFileSize(gifData.totalSize!))
                throw new ZaloApiError(
                    `File ${isFilePath ? getFileName(gif) : gif.filename} size exceed maximum size of ${sharefile.max_size_share_file_v3}MB`,
                );

            const _upthumb = await upthumb(gif, serviceURLs.attachment[ThreadType.User]);

            const formData = new FormData();
            formData.append("chunkContent", isFilePath ? await fs.readFile(gif) : gif.data, {
                filename: isFilePath ? getFileName(gif) : gif.filename,
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
                ttl: ttl ?? 0,
                visibility: isGroupMessage ? 0 : undefined,
                toid: isGroupMessage ? undefined : threadId,
                grid: isGroupMessage ? threadId : undefined,
                thumb: _upthumb.url,
                checksum: (await getMd5LargeFileObject(gif, gifData.totalSize!)).data,
                totalChunk: 1,
                chunkId: 1,
            };

            handleUrgency(params, urgency);

            removeUndefinedKeys(params);
            const encryptedParams = utils.encodeAES(JSON.stringify(params));
            if (!encryptedParams) throw new ZaloApiError("Failed to encrypt message");

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
                url: utils.makeURL(
                    serviceURLs.attachment[type] + attachmentUrlType[data.fileType],
                    Object.assign(
                        {
                            nretry: "0",
                        },
                        data.query || {},
                    ),
                ),
                body: data.body,
                headers: data.fileType == "gif" ? data.headers : {},
            });
        }

        return responses;
    }

    /**
     * Send a message to a thread
     *
     * @param message Message content
     * @param threadId group or user id
     * @param type Message type (User or Group)
     * @param quote Message or GroupMessage instance (optional), used for quoting
     *
     * @throws {ZaloApiError}
     */
    return async function sendMessage(
        message: MessageContent | string,
        threadId: string,
        type: ThreadType = ThreadType.User,
    ) {
        if (!message) throw new ZaloApiError("Missing message content");
        if (!threadId) throw new ZaloApiError("Missing threadId");
        if (typeof message == "string") message = { msg: message };

        let { msg, quote, attachments, mentions, ttl, styles, urgency } = message;

        if (!msg && (!attachments || (attachments && attachments.length == 0)))
            throw new ZaloApiError("Missing message content");

        if (attachments && isExceedMaxFile(attachments.length))
            throw new ZaloApiError("Exceed maximum file of " + sharefile.max_file);

        const responses: {
            message: SendMessageResult | null;
            attachment: SendMessageResult[];
        } = {
            message: null,
            attachment: [],
        };

        if (attachments && attachments.length > 0) {
            const firstExtFile = getFileExtension(typeof attachments[0] == "string" ? attachments[0] : attachments[0].filename);
            const isSingleFile = attachments.length == 1;

            const canBeDesc = isSingleFile && ["jpg", "jpeg", "png", "webp"].includes(firstExtFile);
            if ((!canBeDesc && msg.length > 0) || (msg.length > 0 && quote)) {
                // send message and attachment separately
                await handleMessage(message, threadId, type).then(async (data) => {
                    responses.message = (await send(data))[0];
                });
                msg = "";
                mentions = undefined;
            }
            const handledData = await handleAttachment(
                { msg, mentions, attachments, quote, ttl, styles, urgency },
                threadId,
                type,
            );
            responses.attachment = await send(handledData);
            msg = "";
        }

        if (msg.length > 0) {
            const handledData = await handleMessage(message, threadId, type);
            responses.message = (await send(handledData))[0];
        }

        return responses;
    };
});
