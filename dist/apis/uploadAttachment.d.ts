import { ThreadType, type AttachmentSource } from "../models/index.js";
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
export declare const uploadAttachmentFactory: (ctx: import("../context.js").ContextBase, api: import("../apis.js").API) => (sources: AttachmentSource | AttachmentSource[], threadId: string, type?: ThreadType) => Promise<UploadAttachmentType[]>;
