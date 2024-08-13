import { appContext } from "../context.js";
import { API } from "../index.js";
import { Zalo } from "../index.js";
import { decodeAES, encodeAES, getMd5LargeFileObject, handleGif, request } from "../utils.js";
import fs from "node:fs";
import FormData from "form-data";
import sharp from "sharp";
import { MessageType } from "../models/Message.js";

const urlType = {
    image: "photo_original/send?",
    gif: "gif?",
    video: "asyncfile/msg?",
};

type UpthumbType = {
    hdUrl: string;
    clientFileId: string;
    url: string;
    fileId: string;
}

export function sendMessageAttachmentFactory(serviceURL: string, api: API) {
    let url = {
        [MessageType.GroupMessage]: `${serviceURL}/group/`,
        [MessageType.DirectMessage]: `${serviceURL}/message/`,
    };

    function getGroupLayoutId() {
        return new (class {
            _lastClientId: number;
            getTimeServer: () => number;
            constructor() {
                (this._lastClientId = Date.now()), (this.getTimeServer = () => Date.now());
            }
            next() {
                let e = this.getTimeServer();
                return (
                    e <= this._lastClientId && (this._lastClientId++, (e = this._lastClientId)),
                    (this._lastClientId = e),
                    e
                );
            }
        })();
    }

    async function upthumb(filePath: string, url: string): Promise<UpthumbType> {
        let formData = new FormData();
        let buffer = (await sharp(filePath).png().toBuffer());
        formData.append("fileContent", buffer, {
            filename: "blob",
            contentType: "image/png",
        });

        const params = {
            clientId: Date.now(),
            imei: appContext.imei
        }   

        const encryptedParams = encodeAES(appContext.secretKey!, JSON.stringify(params));
        if (!encryptedParams) throw new Error("Failed to encrypt message");

        console.log(url + `upthumb?zpw_ver=${Zalo.API_VERSION}&zpw_type=${Zalo.API_TYPE}&params=${encodeURIComponent(encryptedParams)}`);

        let response = await request(url + `upthumb?zpw_ver=${Zalo.API_VERSION}&zpw_type=${Zalo.API_TYPE}&params=${encodeURIComponent(encryptedParams)}`, {
            method: "POST",
            headers: formData.getHeaders(),
            body: formData.getBuffer(),
        });

        if (!response.ok) throw new Error("Failed to upload thumbnail: " + response.statusText);
        let resDecode = decodeAES(appContext.secretKey!, (await response.json()).data);
        if (!resDecode) throw new Error("Failed to decode thumbnail");
        if (!JSON.parse(resDecode).data) {
            console.log(resDecode);
            throw new Error("Failed to upload file");
        }

        return JSON.parse(resDecode).data as UpthumbType;
    }

    return async function sendMessageAttachment(
        message: string = "",
        filePaths: string[],
        type: MessageType,
        toid: string
    ) {
        if (!appContext.secretKey) throw new Error("Secret key is not available");
        if (!appContext.imei) throw new Error("IMEI is not available");
        if (!appContext.cookie) throw new Error("Cookie is not available");
        if (!appContext.userAgent) throw new Error("User agent is not available");

        let firstExtFile = filePaths[0].split(".").pop();
        let isMutilFileType = filePaths.some((e) => e.split(".").pop() != firstExtFile);
        const isGroupMessage = type == MessageType.GroupMessage;

        if (isMutilFileType) {
            await api.sendMessage(message, toid);
            message = "";
        }

        let gifFiles = filePaths.filter((e) => e.split(".").pop() == "gif");
        filePaths = filePaths.filter((e) => e.split(".").pop() != "gif");

        let uploadAttachment = await api.uploadAttachment(filePaths, type, toid);

        console.log("Upload attachment", uploadAttachment);
        let paramsData = [],
            indexInGroupLayout = uploadAttachment.length - 1;

        let grid = getGroupLayoutId().next();

        for (const attachment of uploadAttachment) {
            switch (attachment.fileType) {
                case "image": {
                    if (filePaths.length === 1) {
                        console.log("Send single file");
                        let param: any = {
                            queryString: `zpw_ver=${Zalo.API_VERSION}&zpw_type=${Zalo.API_TYPE}&nretry=0`,
                            fileType: attachment.fileType,
                            param: {
                                photoId: attachment.photoId,
                                clientId: Date.now(),
                                desc: message,
                                width: attachment.width,
                                height: attachment.height,
                                toid: isGroupMessage ? undefined : String(toid),
                                grid: isGroupMessage ? String(toid) : undefined,
                                rawUrl: attachment.normalUrl,
                                hdUrl: attachment.hdUrl,
                                thumbUrl: attachment.thumbUrl,
                                oriUrl:
                                    isGroupMessage
                                        ? attachment.normalUrl
                                        : undefined,
                                normalUrl:
                                    isGroupMessage
                                        ? undefined
                                        : attachment.normalUrl,
                                thumbSize: "9815",
                                fileSize: String(attachment.totalSize),
                                hdSize: String(attachment.totalSize),
                                zsource: -1,
                                ttl: 0,
                                imei: appContext.imei,
                            },
                        }

                        const encryptedParams = encodeAES(appContext.secretKey, JSON.stringify(param.param));
                        if (!encryptedParams) throw new Error("Failed to encrypt message");

                        param.body = new URLSearchParams({
                            params: encryptedParams,
                        })

                        paramsData.push(param);
                    } else {
                        console.log("Send multiple files");
                        let param: any = {
                            queryString: `zpw_ver=${Zalo.API_VERSION}&zpw_type=${Zalo.API_TYPE}&nretry=0`,
                            fileType: attachment.fileType,
                            param: {
                                photoId: attachment.photoId,
                                clientId: Date.now(),
                                desc: message,
                                width: attachment.width,
                                height: attachment.height,
                                groupLayoutId: grid,
                                isGroupLayout: 1,
                                idInGroup: indexInGroupLayout--,
                                totalItemInGroup: filePaths.length,
                                toid: isGroupMessage ? undefined : String(toid),
                                grid: isGroupMessage ? String(toid) : undefined,
                                rawUrl: attachment.normalUrl,
                                hdUrl: attachment.hdUrl,
                                thumbUrl: attachment.thumbUrl,
                                oriUrl:
                                    isGroupMessage
                                        ? attachment.normalUrl
                                        : undefined,
                                normalUrl:
                                    isGroupMessage
                                        ? undefined
                                        : attachment.normalUrl,
                                thumbSize: "9815",
                                fileSize: String(attachment.totalSize),
                                hdSize: String(attachment.totalSize),
                                zsource: -1,
                                ttl: 0,
                                imei: appContext.imei,
                            },
                        }

                        const encryptedParams = encodeAES(appContext.secretKey, JSON.stringify(param.param));
                        if (!encryptedParams) throw new Error("Failed to encrypt message");

                        param.body = new URLSearchParams({
                            params: encryptedParams,
                        })
                        paramsData.push(param);
                    }
                    break;
                }

                case "video": {
                    let param: any = {
                        queryString: `zpw_ver=${Zalo.API_VERSION}&zpw_type=${Zalo.API_TYPE}&nretry=0`,
                        fileType: attachment.fileType,
                        param: {
                            fileId: attachment.fileId,
                            checksum: attachment.checksum,
                            checksumSha: "",
                            extention: attachment.fileName.split(".").pop(),
                            totalSize: attachment.totalSize,
                            fileName: attachment.fileName,
                            clientId: Date.now(),
                            ftype: 1,
                            fileCount: 0,
                            fdata: "{}",
                            toid,
                            fileUrl: attachment.fileUrl,
                            zsource: 404,
                            ttl: 0,
                            imei: appContext.imei
                        },
                    }

                    const encryptedParams = encodeAES(appContext.secretKey, JSON.stringify(param.param));
                    if (!encryptedParams) throw new Error("Failed to encrypt message");

                    param.body = new URLSearchParams({
                        params: encryptedParams,
                    })

                    paramsData.push(param);
                    break;
                }
            }

            await new Promise((resolve) => setTimeout(resolve, 1));
        }

        for (const gif of gifFiles) {
            const _upthumb = await upthumb(gif, url[type]);
            let gifData = await handleGif(gif);

            let formData = new FormData();
            formData.append("chunkContent", fs.readFileSync(gif), {
                filename: gif.split("/").pop()!,
                contentType: "application/octet-stream",
            });

            let param = {
                clientId: Date.now().toString(),
                fileName: gifData.fileName,
                totalSize: gifData.totalSize,
                width: gifData.width,
                height: gifData.height,
                msg: message,
                type: 1,
                ttl: 0,
                toid,
                thumb: _upthumb.url,
                checksum: (await getMd5LargeFileObject(gif, gifData.totalSize!)).data,
                totalChunk: 1,
                chunkId: 1,
            }

            console.log(param)

            const encryptedParams = encodeAES(appContext.secretKey, JSON.stringify(param));
            if (!encryptedParams) throw new Error("Failed to encrypt message");

            paramsData.push({
                queryString: `zpw_ver=${Zalo.API_VERSION}&zpw_type=${Zalo.API_TYPE}&params=${encodeURIComponent(encryptedParams)}&type=1`,
                body: formData.getBuffer(),
                headers: formData.getHeaders(),
                fileType: "gif",
            });
        }

        let requests = [];
        let results: any = [];

        for (const param of paramsData) {
            console.log(param.fileType)
            console.log(url[type] + urlType[param.fileType as "gif" | "image" | "video"] + param.queryString,
                param.body, param.headers
            )
            requests.push(
                request(url[type] + urlType[param.fileType as "gif" | "image" | "video"] + param.queryString, {
                    method: "POST",
                    body: param.body,
                    headers: param.headers
                }).then(async (response) => {
                    if (!response.ok)
                        throw new Error("Failed to send message: " + response.statusText);

                    let resDecode = decodeAES(appContext.secretKey!, (await response.json()).data);
                    if (!resDecode) throw new Error("Failed to decode message");
                    results.push(JSON.parse(resDecode));
                })
            );
        }

        await Promise.all(requests);

        return results;
    };
}
