import FormData from "form-data";
import fs from "fs";
import sharp from "sharp";
import { appContext } from "../context.js";
import { API, Zalo } from "../index.js";
import { MessageType } from "../models/Message.js";
import {
    decodeAES,
    encodeAES,
    getFileExtension,
    getFileName,
    getGifMetaData,
    getMd5LargeFileObject,
    makeURL,
    removeUndefinedKeys,
    request,
} from "../utils.js";
import type { MessageContent } from "./sendMessage.js";

const urlType = {
    image: "photo_original/send?",
    gif: "gif?",
    video: "asyncfile/msg?",
    others: "asyncfile/msg?",
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

export function sendMessageAttachmentFactory(serviceURL: string, api: API) {
    const url = {
        [MessageType.GroupMessage]: `${serviceURL}/group/`,
        [MessageType.DirectMessage]: `${serviceURL}/message/`,
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

    /**
     * Send a message with attachments
     *
     * @param message Message content
     * @param filePaths Paths to the files
     * @param threadId group ID or user ID
     * @param type Message type (DirectMessage or GroupMessage)
     */
    return async function sendMessageAttachment(
        message: MessageContent | string,
        filePaths: string[],
        threadId: string,
        type: MessageType = MessageType.DirectMessage,
    ) {
        if (!appContext.secretKey) throw new Error("Secret key is not available");
        if (!appContext.imei) throw new Error("IMEI is not available");
        if (!appContext.cookie) throw new Error("Cookie is not available");
        if (!appContext.userAgent) throw new Error("User agent is not available");

        if (!filePaths || filePaths.length == 0) throw new Error("Missing file paths");
        if (!threadId) throw new Error("Missing threadId");

        if (typeof message == "string") message = { msg: message };

        const firstExtFile = getFileExtension(filePaths[0]);
        const isSingleFile = filePaths.length == 1;
        const isGroupMessage = type == MessageType.GroupMessage;

        const canBeDesc = isSingleFile && ["jpg", "jpeg", "png", "webp"].includes(firstExtFile);
        if (!canBeDesc && message.msg.length > 0) {
            await api.sendMessage(message, threadId, type);
            message = { msg: "" };
        }

        const gifFiles = filePaths.filter((e) => getFileExtension(e) == "gif");
        filePaths = filePaths.filter((e) => getFileExtension(e) != "gif");

        const uploadAttachment = await api.uploadAttachment(filePaths, threadId, type);

        const attachmentsData: AttachmentData[] = [];
        let indexInGroupLayout = uploadAttachment.length - 1;

        const groupLayoutId = getGroupLayoutId();

        const mentionsFinal =
            Array.isArray(message.mentions) && type == MessageType.GroupMessage
                ? message.mentions
                      .filter((m) => m.pos >= 0 && m.uid && m.len > 0)
                      .map((m) => ({
                          pos: m.pos,
                          uid: m.uid,
                          len: m.len,
                          type: m.uid == "-1" ? 1 : 0,
                      }))
                : [];
        const isMentionsValid = mentionsFinal.length > 0 && isGroupMessage && filePaths.length == 1;

        const isMultiFile = filePaths.length > 1;
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
                            desc: message.msg,
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

                            mentionInfo: isMentionsValid ? JSON.stringify(mentionsFinal) : undefined,
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
            const encryptedParams = encodeAES(appContext.secretKey, JSON.stringify(data.params));
            if (!encryptedParams) throw new Error("Failed to encrypt message");

            data.body.append("params", encryptedParams);
            attachmentsData.push(data);
        }

        for (const gif of gifFiles) {
            const _upthumb = await upthumb(gif, url[MessageType.DirectMessage]);
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
                msg: message.msg,
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
            const encryptedParams = encodeAES(appContext.secretKey, JSON.stringify(params));
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

        let requests = [];
        let results: any = [];

        for (const data of attachmentsData) {
            const requestOptions: RequestInit = {
                method: "POST",
                body: data.body,
                headers: data.fileType == "gif" ? data.headers : {},
            };

            requests.push(
                request(
                    makeURL(
                        url[type] + urlType[data.fileType],
                        Object.assign(
                            {
                                zpw_ver: Zalo.API_VERSION,
                                zpw_type: Zalo.API_TYPE,
                                nretry: "0",
                            },
                            data.query || {},
                        ),
                    ),
                    requestOptions,
                ).then(async (response) => {
                    if (!response.ok) throw new Error("Failed to send message: " + response.statusText);

                    let resDecode = decodeAES(appContext.secretKey!, (await response.json()).data);
                    if (!resDecode) throw new Error("Failed to decode message");
                    results.push(JSON.parse(resDecode));
                }),
            );
        }

        await Promise.all(requests);

        return results;
    };
}
