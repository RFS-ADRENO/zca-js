import { appContext } from "../context.js";
import { decodeAES, encodeAES, request } from "../utils.js";
import fs from "node:fs";
import { Zalo } from "../index.js";
import FormData from "form-data";
import { handleImage } from "../utils.js";

export type ImageData = {
    fileName: string;
    totalSize: number | undefined;
    width: number | undefined;
    height: number | undefined;
}

export type UploadResponseType = {
    error_code: number;
    error_message: string;
    data: {
        normalUrl: string;
        photoId: string;
        finished: number;
        hdUrl: string;
        thumbUrl: string;
        clientFileId: string;
        chunkId: number;
    };
}

export type UploadAttachmentType = {
    fileData: {
        fileType: "image";
        data: ImageData;
    } | {
        fileType: "gif";
        data: any;
    } | {
        fileType: "mp4"
        data: any;
    };
    response: UploadResponseType;
}

export function uploadAttachmentFactory(serviceURL: string) {
    return async function uploadAttachment(filePaths: string[], type: "group" | "user", toid: string) {
        if (!appContext.secretKey) throw new Error("Secret key is not available");
        if (!appContext.imei) throw new Error("IMEI is not available");
        if (!appContext.cookie) throw new Error("Cookie is not available");
        if (!appContext.userAgent) throw new Error("User agent is not available");

        let params: {
            fileType: "image" | "gif" | "mp4";
            chunkContent: FormData;
            fileData: ImageData;
            data: {
                totalChunk: number;
                fileName: string;
                clientId: number;
                totalSize: number | undefined;
                imei: string;
                toid: string;
                isE2EE: number;
                jxl: number;
                chunkId: number;
            }
        }[] = []

        for (const filePath of filePaths) {
            if (!fs.existsSync(filePath)) throw new Error("File not found");

            const extFile = filePath.split('.').pop();
            const fileName = filePath.split('/').pop()!;

            switch (extFile) {
                case "jpg":
                case "jpeg":
                case "png":
                case "webp":
                    const imageData = await handleImage(filePath);

                    const formData = new FormData();
                    formData.append("chunkContent", fs.readFileSync(filePath), {
                        filename: fileName,
                        contentType: "application/octet-stream"
                    });

                    params.push({
                        fileType: "image",
                        chunkContent: formData,
                        fileData: imageData,
                        data: {
                            totalChunk: 1,
                            fileName,
                            totalSize: imageData.totalSize,
                            imei: appContext.imei,
                            toid,
                            isE2EE: 0,
                            jxl: 0,
                            chunkId: 1,
                            clientId: Date.now(),
                        }
                    })
                    break;
                case "gif":
                    throw new Error("Gif file type is not support yet");
                case "mp4":
                    throw new Error("Mp4 file type is not support yet");
                default:
                    throw new Error("Unsupported file type");
            }

            await new Promise((resolve) => setTimeout(resolve, 1));
        }

        let url = `${serviceURL}/${type == "group" ? "group" : "message"}/`
        let queryString = `zpw_ver=${Zalo.API_VERSION}&zpw_type=${Zalo.API_TYPE}&type=${type == "group" ? "11" : "2"}`
        
        let requests = [];
        let results: UploadAttachmentType[] = [];
        for (const param of params) {
            let urlType = `${param.fileType == "image" ? `photo_original/upload?` : null}`;
            const encryptedParams = encodeAES(appContext.secretKey, JSON.stringify(param.data));
            if (!encryptedParams) throw new Error("Failed to encrypt message");

            requests.push(request(
                url + urlType + queryString + `&params=${encodeURIComponent(encryptedParams)}`,
                {
                    method: "POST",
                    headers: param.chunkContent.getHeaders(),
                    body: param.chunkContent.getBuffer()
                }
            ).then(async (response) => {
                if (!response.ok) throw new Error("Failed to send message: " + response.statusText);

                let resDecode = decodeAES(appContext.secretKey!, (await response.json()).data);
                if (!resDecode) throw new Error("Failed to decode message");
                if (!JSON.parse(resDecode).data) throw new Error("Failed to upload file");

                results.push({
                    fileData: {
                        fileType: param.fileType,
                        data: param.fileData
                    },
                    response: JSON.parse(resDecode)
                });
            }));
        }

        await Promise.all(requests);

        return results;
    };
}