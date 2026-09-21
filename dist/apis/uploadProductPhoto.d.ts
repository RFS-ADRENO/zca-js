import type { AttachmentSource } from "../models/index.js";
export type UploadProductPhotoPayload = {
    file: AttachmentSource;
};
export type UploadProductPhotoResponse = {
    normalUrl: string;
    photoId: string;
    finished: number;
    hdUrl: string;
    thumbUrl: string;
    clientFileId: number;
    chunkId: number;
};
export declare const uploadProductPhotoFactory: (ctx: import("../context.js").ContextBase, api: import("../apis.js").API) => (payload: UploadProductPhotoPayload) => Promise<UploadProductPhotoResponse>;
