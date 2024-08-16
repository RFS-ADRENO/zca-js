import { appContext } from "../context.js";
import { decodeAES, encodeAES, getMd5LargeFileObject, getGifMetaData, getVideoSize, request } from "../utils.js";
import fs from "fs";
import path from "path";
import { API, Zalo } from "../index.js";
import FormData from "form-data";
import { getImageMetaData } from "../utils.js";
import { MessageType } from "../models/Message.js";

type ImageResponse = {
    normalUrl: string;
    photoId: string;
    finished: number;
    hdUrl: string;
    thumbUrl: string;
    clientFileId: string;
    chunkId: number;

    fileType: "image";
    width: number;
    height: number;
    totalSize: number;
    hdSize: number;
}

type VideoResponse = {
    finished: number;
    clientFileId: number;
    chunkId: number;

    fileType: "video";
    fileUrl: string;
    fileId: string;
    checksum: string;
    totalSize: number;
    fileName: string;
}

export type ImageData = {
    fileName: string;
    totalSize: number | undefined;
    width: number | undefined;
    height: number | undefined;
};

export type VideoData = {
    fileName: string;
    totalSize: number;
}

export type UploadAttachmentType = ImageResponse | VideoResponse;

type ParamType = {
    filePath: string;
    fileType: "image";
    chunkContent: FormData;
    fileData: ImageData;
    data: {
        toid?: string;
        grid?: string;
        totalChunk: number;
        fileName: string;
        clientId: number;
        totalSize: number;
        imei: string;
        isE2EE: number;
        jxl: number;
        chunkId: number;
    };
} | {
    filePath: string;
    fileType: "video";
    chunkContent: FormData;
    fileData: VideoData;
    data: {
        toid?: string;
        grid?: string;
        totalChunk: number;
        fileName: string;
        clientId: number;
        totalSize: number;
        imei: string;
        isE2EE: number;
        jxl: number;
        chunkId: number;
    };
}

const urlType = {
    image: "photo_original/upload?",
    video: "asyncfile/upload?",
};

export function uploadAttachmentFactory(serviceURL: string, api: API) {
    return async function uploadAttachment(
        filePaths: string[],
        type: MessageType,
        toid: string
    ): Promise<UploadAttachmentType[]> {
        if (!appContext.secretKey) throw new Error("Secret key is not available");
        if (!appContext.imei) throw new Error("IMEI is not available");
        if (!appContext.cookie) throw new Error("Cookie is not available");
        if (!appContext.userAgent) throw new Error("User agent is not available");

        const isGroupMessage = type == MessageType.GroupMessage;
        let params: ParamType[] = [];
        let url = `${serviceURL}/${isGroupMessage ? "group" : "message"}/`;
        let queryString = `zpw_ver=${Zalo.API_VERSION}&zpw_type=${Zalo.API_TYPE}&type=${isGroupMessage ? "11" : "2"}`;

        for (const filePath of filePaths) {
            if (!fs.existsSync(filePath)) throw new Error("File not found");

            const extFile = path.extname(filePath).slice(1);
            const fileName = path.basename(filePath);

            const formData = new FormData();
            formData.append("chunkContent", fs.readFileSync(filePath), {
                filename: fileName,
                contentType: "application/octet-stream",
            });

            let param: ParamType = {
                filePath,
                chunkContent: formData,
                data: {}
            } as ParamType;

            if (isGroupMessage) param.data.grid = toid;
            else param.data.toid = toid;

            switch (extFile) {
                case "jpg":
                case "jpeg":
                case "png":
                case "webp":
                    let imageData = await getImageMetaData(filePath);

                    param.fileData = imageData;
                    param.fileType = "image";

                    param.data.totalChunk = 1;
                    param.data.fileName = fileName;
                    param.data.clientId = Date.now();
                    param.data.totalSize = imageData.totalSize!;
                    param.data.imei = appContext.imei;
                    param.data.isE2EE = 0;
                    param.data.jxl = 0;
                    param.data.chunkId = 1;

                    break;
                case "mp4":
                    let videoData = await getVideoSize(filePath);

                    param.fileType = "video";
                    param.fileData = {
                        fileName,
                        totalSize: videoData,
                    }

                    param.data.totalChunk = 1;
                    param.data.fileName = fileName;
                    param.data.clientId = Date.now();
                    param.data.totalSize = videoData;
                    param.data.imei = appContext.imei;
                    param.data.isE2EE = 0;
                    param.data.jxl = 0;
                    param.data.chunkId = 1;

                    break;
                default:
                    throw new Error("API does not support file type yet");
            }

            params.push(param);

            await new Promise((resolve) => setTimeout(resolve, 1));
        }

        let requests = [];
        let results: UploadAttachmentType[] = [];
        for (const param of params) {
            const encryptedParams = encodeAES(appContext.secretKey, JSON.stringify(param.data));
            if (!encryptedParams) throw new Error("Failed to encrypt message");
            requests.push(
                request(
                    url +
                    urlType[param.fileType] +
                    queryString +
                    `&params=${encodeURIComponent(encryptedParams)}`,
                    {
                        method: "POST",
                        headers: param.chunkContent.getHeaders(),
                        body: param.chunkContent.getBuffer(),
                    }
                ).then(async (response) => {
                    if (!response.ok)
                        throw new Error("Failed to send message: " + response.statusText);

                    let resDecode = decodeAES(appContext.secretKey!, (await response.json()).data);
                    if (!resDecode) throw new Error("Failed to decode message");
                    if (!JSON.parse(resDecode).data) throw new Error("Failed to upload attachment");

                    await new Promise<void>((resolve) => {
                        if (param.fileType == "video") {
                            api.listener.once("upload_attachment", async (data) => {
                                let result = {
                                    fileType: "video",
                                    ...(JSON.parse(resDecode)).data,
                                    ...data,
                                    totalSize: param.fileData.totalSize,
                                    fileName: param.fileData.fileName,
                                    checksum: (await getMd5LargeFileObject(param.filePath, param.fileData.totalSize)).data,
                                }
                                results.push(result);
                                resolve();
                            })
                        }

                        if (param.fileType == "image") {
                            let result = {
                                fileType: "image",
                                width: param.fileData.width,
                                height: param.fileData.height,
                                totalSize: param.fileData.totalSize,
                                hdSize: param.fileData.totalSize,
                                ...(JSON.parse(resDecode)).data,
                            }
                            results.push(result);
                            resolve();
                        }
                    });
                })
            );
        }

        await Promise.all(requests);

        return results;
    };
}
