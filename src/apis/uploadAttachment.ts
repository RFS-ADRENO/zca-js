import FormData from "form-data";
import fs from "node:fs";
import type { UploadCallback } from "../context.js";
import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { ThreadType, type AttachmentSource } from "../models/index.js";
import {
    apiFactory,
    getFileExtension,
    getFileName,
    getFileSize,
    getImageMetaData,
    getMd5LargeFileObject,
    openAttachmentReader,
    resolveResponse,
    type AttachmentReader,
} from "../utils.js";

export type UploadAttachmentImageResponse = {
    normalUrl: string;
    photoId: string;
    finished: number | boolean;
    hdUrl: string;
    thumbUrl: string;
    clientFileId: number;
    chunkId: number;

    fileType: "image";
    width: number;
    height: number;
    totalSize: number;
    hdSize: number;
};

export type UploadAttachmentVideoResponse = {
    finished: number | boolean;
    clientFileId: number;
    chunkId: number;

    fileType: "video";
    fileUrl: string;
    fileId: string;
    checksum: string;
    totalSize: number;
    fileName: string;
};

export type UploadAttachmentFileResponse = {
    finished: number | boolean;
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

export type UploadAttachmentType = UploadAttachmentImageResponse | UploadAttachmentVideoResponse | UploadAttachmentFileResponse;
export type UploadAttachmentResponse = UploadAttachmentType[];

type RawResponse = {
    finished: number | boolean;
    clientFileId: number;
    chunkId: number;

    fileId?: string;
    photoId?: string;

    normalUrl?: string;
    hdUrl?: string;
    thumbUrl?: string;
};

type AttachmentData =
    | {
          filePath: string;
          fileType: "image";
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
          };
          source: AttachmentSource;
      }
    | {
          filePath: string;
          fileType: "video" | "others";
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
          };
          source: AttachmentSource;
      };

const urlType = {
    image: "photo_original/upload",
    video: "asyncfile/upload",
    others: "asyncfile/upload",
};

/** Chunk requests in flight at once: each holds one chunk in memory, so a large file never does. */
const CHUNK_REQUESTS_IN_FLIGHT = 4;
/** The failure when the socket closes before Zalo confirms an upload: a closed socket never delivers file_done. */
const SOCKET_CLOSED = "The connection closed before Zalo confirmed the upload";

export const uploadAttachmentFactory = apiFactory()((api, ctx, utils) => {
    const serviceURL = `${api.zpwServiceMap.file[0]}/api`;
    const { sharefile } = ctx.settings!.features;

    function isExceedMaxFile(totalFile: number) {
        return totalFile > sharefile.max_file;
    }

    function isExceedMaxFileSize(fileSize: number) {
        return fileSize > sharefile.max_size_share_file_v3 * 1024 * 1024;
    }

    function isExtensionValid(ext: string) {
        return sharefile.restricted_ext_file.indexOf(ext) == -1;
    }

    /**
     * Upload an attachment to a thread
     *
     * @param sources path to files or attachment sources
     * @param threadId Group or User ID
     * @param type Message type (User or Group)
     *
     * @throws {ZaloApiError | ZaloApiMissingImageMetadataGetter}
     */
    return async function uploadAttachment(
        sources: AttachmentSource | AttachmentSource[],
        threadId: string,
        type: ThreadType = ThreadType.User,
    ): Promise<UploadAttachmentType[]> {
        if (!sources) throw new ZaloApiError("Missing sources");
        if (!Array.isArray(sources)) sources = [sources];
        if (sources.length == 0) throw new ZaloApiError("Missing sources");
        if (isExceedMaxFile(sources.length)) throw new ZaloApiError("Exceed maximum file of " + sharefile.max_file);
        if (!threadId) throw new ZaloApiError("Missing threadId");

        const chunkSize = ctx.settings!.features.sharefile.chunk_size_file;
        const isGroupMessage = type == ThreadType.Group;
        const attachmentsData: AttachmentData[] = [];
        const url = `${serviceURL}/${isGroupMessage ? "group" : "message"}/`;
        const typeParam = isGroupMessage ? "11" : "2";

        let clientId = Date.now();
        for (const source of sources) {
            const isFilePath = typeof source == "string";
            const isBuffer = typeof source == "object" && source.data instanceof Buffer;

            if (!isFilePath && !isBuffer) throw new ZaloApiError("Invalid source type");
            if (!isFilePath && !source.filename) throw new ZaloApiError("Missing filename");

            if (isFilePath && !fs.existsSync(source)) throw new ZaloApiError("File not found");

            const extFile = getFileExtension(isFilePath ? source : source.filename).toLowerCase();
            const fileName = isFilePath ? getFileName(source) : source.filename;

            if (isExtensionValid(extFile) == false)
                throw new ZaloApiError(`File extension "${extFile}" is not allowed`);

            const data: AttachmentData = {
                filePath: isFilePath ? source : source.filename,
                params: {},
                source,
            } as AttachmentData;

            if (isGroupMessage) data.params.grid = threadId;
            else data.params.toid = threadId;

            switch (extFile) {
                case "jpg":
                case "jpeg":
                case "png":
                case "webp": {
                    const imageData = isFilePath ? await getImageMetaData(ctx, source) : { ...source.metadata, fileName };
                    if (isExceedMaxFileSize(imageData.totalSize!))
                        throw new ZaloApiError(
                            `File ${fileName} size exceed maximum size of ${sharefile.max_size_share_file_v3}MB`,
                        );

                    data.fileData = imageData;
                    data.fileType = "image";

                    data.params.totalChunk = Math.ceil(data.fileData.totalSize! / chunkSize);
                    data.params.fileName = fileName;
                    data.params.clientId = clientId++;
                    data.params.totalSize = imageData.totalSize!;
                    data.params.imei = ctx.imei;
                    data.params.isE2EE = 0;
                    data.params.jxl = 0;

                    break;
                }
                case "mp4": {
                    const videoSize = isFilePath ? await getFileSize(source) : source.metadata.totalSize;
                    if (isExceedMaxFileSize(videoSize))
                        throw new ZaloApiError(
                            `File ${fileName} size exceed maximum size of ${sharefile.max_size_share_file_v3}MB`,
                        );

                    data.fileType = "video";
                    data.fileData = {
                        fileName,
                        totalSize: videoSize,
                    };

                    data.params.totalChunk = Math.ceil(data.fileData.totalSize! / chunkSize);
                    data.params.fileName = fileName;
                    data.params.clientId = clientId++;
                    data.params.totalSize = videoSize;
                    data.params.imei = ctx.imei;
                    data.params.isE2EE = 0;
                    data.params.jxl = 0;

                    break;
                }
                default: {
                    const fileSize = isFilePath ? await getFileSize(source) : source.metadata.totalSize;
                    if (isExceedMaxFileSize(fileSize))
                        throw new ZaloApiError(
                            `File ${fileName} size exceed maximum size of ${sharefile.max_size_share_file_v3}MB`,
                        );

                    data.fileType = "others";
                    data.fileData = {
                        fileName,
                        totalSize: fileSize,
                    };

                    data.params.totalChunk = Math.ceil(data.fileData.totalSize! / chunkSize);
                    data.params.fileName = fileName;
                    data.params.clientId = clientId++;
                    data.params.totalSize = fileSize;
                    data.params.imei = ctx.imei;
                    data.params.isE2EE = 0;
                    data.params.jxl = 0;

                    break;
                }
            }

            attachmentsData.push(data);
        }

        const jobs = attachmentsData.flatMap((data, atmIndex) =>
            Array.from({ length: data.params.totalChunk }, (_, index) => ({ atmIndex, index })),
        );
        const results: UploadAttachmentType[] = [];
        const readers: AttachmentReader[] = [];
        try {
            for (const data of attachmentsData) readers.push(await openAttachmentReader(data.source));

            let next = 0;
            let failed = false;
            const sendChunk = async ({ atmIndex, index }: { atmIndex: number; index: number }) => {
                const data = attachmentsData[atmIndex];
                if ((data.fileType == "video" || data.fileType == "others") && ctx.socketOpen === false)
                    throw new ZaloApiError(SOCKET_CLOSED);
                const encryptedParams = utils.encodeAES(JSON.stringify({ ...data.params, chunkId: index + 1 }));
                if (!encryptedParams) throw new ZaloApiError("Failed to encrypt message");

                const start = index * chunkSize;
                const formData = new FormData();
                formData.append(
                    "chunkContent",
                    await readers[atmIndex].read(start, Math.min(chunkSize, data.params.totalSize - start)),
                    {
                        filename: data.params.fileName,
                        contentType: "application/octet-stream",
                    },
                );

                const response = await utils.request(
                    utils.makeURL(url + urlType[data.fileType], { type: typeParam, params: encryptedParams }),
                    {
                        method: "POST",
                        headers: formData.getHeaders(),
                        body: formData.getBuffer(),
                    },
                );

                /**
                 * @TODO: better type rather than any
                 */
                const resData = await resolveResponse<RawResponse>(ctx, response);

                if (resData && resData.fileId != "-1" && resData.photoId != "-1")
                    await new Promise<void>((resolve, reject) => {
                        if (data.fileType == "video" || data.fileType == "others") {
                            if (ctx.socketOpen === false) return reject(new ZaloApiError(SOCKET_CLOSED));

                            const uploadCallback: UploadCallback = async (wsData) => {
                                if ("closed" in wsData) return reject(new ZaloApiError(SOCKET_CLOSED));
                                try {
                                    const md5 = await getMd5LargeFileObject(data.source, data.fileData.totalSize);
                                    const result = {
                                        fileType: data.fileType,
                                        ...resData,
                                        ...wsData,
                                        totalSize: data.fileData.totalSize,
                                        fileName: data.fileData.fileName,
                                        checksum: md5.data,
                                    };
                                    results[atmIndex] = result;
                                    resolve();
                                } catch (error) {
                                    reject(error);
                                }
                            };

                            ctx.uploadCallbacks.set(resData.fileId!.toString(), uploadCallback);
                        }

                        if (data.fileType == "image") {
                            const result = {
                                fileType: "image" as const,
                                width: data.fileData.width!,
                                height: data.fileData.height!,
                                totalSize: data.fileData.totalSize!,
                                hdSize: data.fileData.totalSize!,

                                finished: resData.finished,
                                normalUrl: resData.normalUrl!,
                                hdUrl: resData.hdUrl!,
                                thumbUrl: resData.thumbUrl!,
                                chunkId: resData.chunkId,

                                photoId: resData.photoId!,
                                clientFileId: resData.clientFileId,
                            };
                            results[atmIndex] = result;
                            resolve();
                        }
                    });
            };

            const worker = async () => {
                while (!failed && next < jobs.length) {
                    await sendChunk(jobs[next++]).catch((error) => {
                        failed = true;
                        throw error;
                    });
                }
            };
            await Promise.all(Array.from({ length: Math.min(CHUNK_REQUESTS_IN_FLIGHT, jobs.length) }, worker));
        } finally {
            await Promise.all(readers.map((reader) => reader.close()));
        }

        return results;
    };
});
