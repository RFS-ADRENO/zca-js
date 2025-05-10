import { ThreadType } from "../models/index.js";
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
export type UploadAttachmentResponse = UploadAttachmentType[];
export declare const uploadAttachmentFactory: (ctx: import("../context.js").ContextBase, api: import("../zalo.js").API) => (filePaths: string[], threadId: string, type?: ThreadType) => Promise<UploadAttachmentType[]>;
export {};
