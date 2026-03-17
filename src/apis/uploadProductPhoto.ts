import fs from "node:fs";
import FormData from "form-data";
import { ZaloApiError } from "../Errors/ZaloApiError.js";
import type { AttachmentSource } from "../models/index.js";
import { apiFactory, getImageMetaData } from "../utils.js";

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

export const uploadProductPhotoFactory = apiFactory<UploadProductPhotoResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.file[0]}/api/product/upload/photo`);

    /**
     * Upload product photo for api quick message, product catalog or custom local storage
     *
     * @param payload file path or attachment source
     *
     * @throws {ZaloApiError | ZaloApiMissingImageMetadataGetter}
     */
    return async function uploadProductPhoto(payload: UploadProductPhotoPayload) {
        const isSourceFilePath = typeof payload.file == "string";
        const fileMetaData = isSourceFilePath
            ? await getImageMetaData(ctx, payload.file as string)
            : (payload.file as { metadata: { totalSize: number; width?: number; height?: number } }).metadata;

        const fileSize = fileMetaData.totalSize || 0;

        const fileBuffer = isSourceFilePath
            ? await fs.promises.readFile(payload.file as string)
            : (payload.file as { data: Buffer }).data;

        const formData = new FormData();
        formData.append("chunkContent", fileBuffer, {
            filename: "undefined",
            contentType: "application/octet-stream",
        });

        const params = {
            totalChunk: 1,
            fileName: `Base64_Img_Picker_${Date.now()}.jpg`,
            clientId: Date.now(),
            totalSize: fileSize,
            imei: ctx.imei,
            chunkId: 1,
            toid: ctx.loginInfo.send2me_id,
            featureId: 1,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(
            utils.makeURL(serviceURL, {
                params: encryptedParams,
            }),
            {
                method: "POST",
                headers: formData.getHeaders(),
                body: new Uint8Array(formData.getBuffer()),
            },
        );

        return utils.resolve(response);
    };
});
