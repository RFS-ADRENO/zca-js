import FormData from "form-data";
import fs from "fs";
import path from "path";
import { appContext, UploadCallback } from "../context.js";
import { API, Zalo } from "../index.js";
import { MessageType } from "../models/Message.js";
import {
    decodeAES,
    encodeAES,
    getFileSize,
    getImageMetaData,
    getMd5LargeFileObject,
    makeURL,
    request,
} from "../utils.js";

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
};

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
};

type FileResponse = {
    finished: number;
    clientFileId: number;
    chunkId: number;

    fileType: "others";
    fileUrl: string;
    fileId: string;
    checksum: string;
    totalSize: number;
    fileName: string;
};

export type ImageData = {
    fileName: string;
    totalSize: number | undefined;
    width: number | undefined;
    height: number | undefined;
};

export type FileData = {
    fileName: string;
    totalSize: number;
};

export type UploadAttachmentType = ImageResponse | VideoResponse | FileResponse;

type AttachmentData =
    | {
          filePath: string;
          fileType: "image";
          chunkContent: FormData[];
          fileData: ImageData;
          params: {
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
    | {
          filePath: string;
          fileType: "video" | "others";
          chunkContent: FormData[];
          fileData: FileData;
          params: {
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
      };

const urlType = {
    image: "photo_original/upload",
    video: "asyncfile/upload",
    others: "asyncfile/upload",
};

export function uploadAttachmentFactory(serviceURL: string, api: API) {
    return async function uploadAttachment(
        filePaths: string[],
        threadId: string,
        type: MessageType = MessageType.DirectMessage,
    ): Promise<UploadAttachmentType[]> {
        if (!appContext.secretKey) throw new Error("Secret key is not available");
        if (!appContext.imei) throw new Error("IMEI is not available");
        if (!appContext.cookie) throw new Error("Cookie is not available");
        if (!appContext.userAgent) throw new Error("User agent is not available");

        if (!filePaths || filePaths.length == 0) throw new Error("Missing filePaths");
        if (!threadId) throw new Error("Missing threadId");

        const chunkSize = appContext.settings!.features.sharefile.chunk_size_file;
        const isGroupMessage = type == MessageType.GroupMessage;
        let attachmentsData: AttachmentData[] = [];
        let url = `${serviceURL}/${isGroupMessage ? "group" : "message"}/`;
        const query = {
            zpw_ver: Zalo.API_VERSION,
            zpw_type: Zalo.API_TYPE,
            type: isGroupMessage ? "11" : "2",
        };

        let clientId = Date.now();
        for (const filePath of filePaths) {
            if (!fs.existsSync(filePath)) throw new Error("File not found");

            const extFile = path.extname(filePath).slice(1);
            const fileName = path.basename(filePath);

            const data: AttachmentData = {
                filePath,
                chunkContent: [] as FormData[],
                params: {},
            } as AttachmentData;

            if (isGroupMessage) data.params.grid = threadId;
            else data.params.toid = threadId;

            switch (extFile) {
                case "jpg":
                case "jpeg":
                case "png":
                case "webp":
                    let imageData = await getImageMetaData(filePath);

                    data.fileData = imageData;
                    data.fileType = "image";

                    data.params.totalChunk = Math.ceil(data.fileData.totalSize! / chunkSize);
                    data.params.fileName = fileName;
                    data.params.clientId = clientId++;
                    data.params.totalSize = imageData.totalSize!;
                    data.params.imei = appContext.imei;
                    data.params.isE2EE = 0;
                    data.params.jxl = 0;
                    data.params.chunkId = 1;

                    break;
                case "mp4":
                    let videoSize = await getFileSize(filePath);

                    data.fileType = "video";
                    data.fileData = {
                        fileName,
                        totalSize: videoSize,
                    };

                    data.params.totalChunk = Math.ceil(data.fileData.totalSize! / chunkSize);
                    data.params.fileName = fileName;
                    data.params.clientId = clientId++;
                    data.params.totalSize = videoSize;
                    data.params.imei = appContext.imei;
                    data.params.isE2EE = 0;
                    data.params.jxl = 0;
                    data.params.chunkId = 1;

                    break;
                default:
                    const fileSize = await getFileSize(filePath);

                    data.fileType = "others";
                    data.fileData = {
                        fileName,
                        totalSize: fileSize,
                    };

                    data.params.totalChunk = Math.ceil(data.fileData.totalSize! / chunkSize);
                    data.params.fileName = fileName;
                    data.params.clientId = clientId++;
                    data.params.totalSize = fileSize;
                    data.params.imei = appContext.imei;
                    data.params.isE2EE = 0;
                    data.params.jxl = 0;
                    data.params.chunkId = 1;

                    break;
            }

            const fileBuffer = await fs.promises.readFile(filePath);
            for (let i = 0; i < data.params.totalChunk; i++) {
                const formData = new FormData();
                const slicedBuffer = fileBuffer.subarray(i * chunkSize, (i + 1) * chunkSize);
                formData.append("chunkContent", slicedBuffer, {
                    filename: fileName,
                    contentType: "application/octet-stream",
                });

                data.chunkContent[i] = formData;
            }
            attachmentsData.push(data);
        }

        let requests = [];
        let results: UploadAttachmentType[] = [];
        for (const data of attachmentsData) {
            for (let i = 0; i < data.params.totalChunk; i++) {
                const encryptedParams = encodeAES(appContext.secretKey, JSON.stringify(data.params));
                if (!encryptedParams) throw new Error("Failed to encrypt message");

                requests.push(
                    request(makeURL(url + urlType[data.fileType], Object.assign(query, { params: encryptedParams })), {
                        method: "POST",
                        headers: data.chunkContent[i].getHeaders(),
                        body: data.chunkContent[i].getBuffer(),
                    }).then(async (response) => {
                        if (!response.ok) throw new Error("Failed to send message: " + response.statusText);

                        let resDecode = decodeAES(appContext.secretKey!, (await response.json()).data);
                        if (!resDecode) throw new Error("Failed to decode message");
                        const resData = JSON.parse(resDecode);
                        if (!resData.data) throw new Error("Failed to upload attachment: " + resData.error);

                        if (resData.data.fileId != -1)
                            await new Promise<void>((resolve) => {
                                if (data.fileType == "video" || data.fileType == "others") {
                                    const uploadCallback: UploadCallback = async (wsData) => {
                                        let result = {
                                            fileType: data.fileType,
                                            ...JSON.parse(resDecode).data,
                                            ...wsData,
                                            totalSize: data.fileData.totalSize,
                                            fileName: data.fileData.fileName,
                                            checksum: (
                                                await getMd5LargeFileObject(data.filePath, data.fileData.totalSize)
                                            ).data,
                                        };
                                        results.push(result);
                                        resolve();
                                    };

                                    appContext.uploadCallbacks.set(resData.data.fileId, uploadCallback);
                                }

                                if (data.fileType == "image") {
                                    let result = {
                                        fileType: "image",
                                        width: data.fileData.width,
                                        height: data.fileData.height,
                                        totalSize: data.fileData.totalSize,
                                        hdSize: data.fileData.totalSize,
                                        ...JSON.parse(resDecode).data,
                                    };
                                    results.push(result);
                                    resolve();
                                }
                            });
                    }),
                );
                data.params.chunkId++;
            }
        }

        await Promise.all(requests);

        return results;
    };
}
