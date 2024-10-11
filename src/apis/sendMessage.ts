import FormData from "form-data";
import fs from "node:fs";
import sharp from "sharp";
import { appContext } from "../context.js";
import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { GroupMessage, Message, MessageType } from "../models/Message.js";
import {
    encodeAES,
    getClientMessageType,
    getFileExtension,
    getFileName,
    getGifMetaData,
    getMd5LargeFileObject,
    handleZaloResponse,
    makeURL,
    removeUndefinedKeys,
    request,
} from "../utils.js";

import type { API } from "../zalo.js";

export type SendMessageResult = {
    msgId: number;
};

export type SendMessageResponse = {
    message: SendMessageResult | null;
    attachment: SendMessageResult[];
};

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

async function send(data: SendType | SendType[]): Promise<SendMessageResult[]> {
    if (!Array.isArray(data)) data = [data];

    const requests: Promise<SendMessageResult>[] = [];

    for (const each of data) {
        requests.push(
            (async () => {
                const response = await request(each.url, {
                    method: "POST",
                    body: each.body,
                    headers: each.headers,
                });

                const result = await handleZaloResponse<SendMessageResult>(response);
                if (result.error) throw new ZaloApiError(result.error.message, result.error.code);

                return result.data as SendMessageResult;
            })(),
        );
    }

    return await Promise.all(requests);
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
                zpw_ver: appContext.API_VERSION,
                zpw_type: appContext.API_TYPE,
                nretry: 0,
            }),
            [MessageType.GroupMessage]: makeURL(`${api.zpwServiceMap.group[0]}/api/group`, {
                zpw_ver: appContext.API_VERSION,
                zpw_type: appContext.API_TYPE,
                nretry: 0,
            }),
        },
        attachment: {
            [MessageType.DirectMessage]: `${api.zpwServiceMap.file[0]}/api/message/`,
            [MessageType.GroupMessage]: `${api.zpwServiceMap.file[0]}/api/group/`,
        },
    };

    const { sharefile } = appContext.settings!.features;

    function isExceedMaxFile(totalFile: number) {
        return totalFile > sharefile.max_file;
    }

    function isExceedMaxFileSize(fileSize: number) {
        return fileSize > sharefile.max_size_share_file_v3 * 1024 * 1024;
    }

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
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt message");

        let response = await request(
            makeURL(url + "upthumb?", {
                zpw_ver: appContext.API_VERSION,
                zpw_type: appContext.API_TYPE,
                params: encryptedParams,
            }),
            {
                method: "POST",
                headers: formData.getHeaders(),
                body: formData.getBuffer(),
            },
        );

        const result = await handleZaloResponse<UpthumbType>(response);
        if (result.error) throw new ZaloApiError(result.error.message, result.error.code);

        return result.data as UpthumbType;
    }

    function handleMentions(type: MessageType, msg: string, mentions?: Mention[]) {
        let totalMentionLen = 0;
        const mentionsFinal =
            Array.isArray(mentions) && type == MessageType.GroupMessage
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

    async function handleMessage({ msg, mentions, quote }: MessageContent, threadId: string, type: MessageType) {
        if (!msg || msg.length == 0) throw new ZaloApiError("Missing message content");
        const isValidInstance = quote instanceof Message || quote instanceof GroupMessage;
        if (quote && !isValidInstance) throw new ZaloApiError("Invalid quote message");
        const isGroupMessage = type == MessageType.GroupMessage;

        const { mentionsFinal, msgFinal } = handleMentions(type, msg, mentions);
        msg = msgFinal;

        const quoteData = quote?.data;
        if (quoteData) {
            if (typeof quoteData.content != "string" && quoteData.msgType == "webchat") {
                throw new ZaloApiError("This kind of `webchat` quote type is not available");
            }

            if (quoteData.msgType == "group.poll") {
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
        { msg, attachments, mentions, quote }: MessageContent,
        threadId: string,
        type: MessageType,
    ) {
        if (!attachments || attachments.length == 0) throw new ZaloApiError("Missing attachments");

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
            if (!encryptedParams) throw new ZaloApiError("Failed to encrypt message");

            data.body.append("params", encryptedParams);
            attachmentsData.push(data);
        }

        for (const gif of gifFiles) {
            const gifData = await getGifMetaData(gif);
            if (isExceedMaxFileSize(gifData.totalSize!))
                throw new ZaloApiError(
                    `File ${getFileName(gif)} size exceed maximum size of ${sharefile.max_size_share_file_v3}MB`,
                );

            const _upthumb = await upthumb(gif, serviceURLs.attachment[MessageType.DirectMessage]);

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
                url: makeURL(
                    serviceURLs.attachment[type] + attachmentUrlType[data.fileType],
                    Object.assign(
                        {
                            zpw_ver: appContext.API_VERSION,
                            zpw_type: appContext.API_TYPE,
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
     * @param type Message type (DirectMessage or GroupMessage)
     * @param quote Message or GroupMessage instance (optional), used for quoting
     *
     * @throws {ZaloApiError}
     */
    return async function sendMessage(
        message: MessageContent | string,
        threadId: string,
        type: MessageType = MessageType.DirectMessage,
    ) {
        if (!appContext.secretKey) throw new ZaloApiError("Secret key is not available");
        if (!appContext.imei) throw new ZaloApiError("IMEI is not available");
        if (!appContext.cookie) throw new ZaloApiError("Cookie is not available");
        if (!appContext.userAgent) throw new ZaloApiError("User agent is not available");

        if (!message) throw new ZaloApiError("Missing message content");
        if (!threadId) throw new ZaloApiError("Missing threadId");
        if (typeof message == "string") message = { msg: message };

        let { msg, quote, attachments, mentions } = message;

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
            const firstExtFile = getFileExtension(attachments[0]);
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
            const handledData = await handleAttachment({ msg, mentions, attachments, quote }, threadId, type);
            responses.attachment = await send(handledData);
            msg = "";
        }

        if (msg.length > 0) {
            const handledData = await handleMessage(message, threadId, type);
            responses.message = (await send(handledData))[0];
        }

        return responses;
    };
}
