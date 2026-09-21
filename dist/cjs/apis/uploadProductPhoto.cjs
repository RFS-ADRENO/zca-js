'use strict';

var fs = require('node:fs');
var FormData = require('form-data');
var ZaloApiError = require('../Errors/ZaloApiError.cjs');
var utils = require('../utils.cjs');

const uploadProductPhotoFactory = utils.apiFactory()((api, ctx, utils$1) => {
    const serviceURL = utils$1.makeURL(`${api.zpwServiceMap.file[0]}/api/product/upload/photo`);
    /**
     * Upload product photo for api quick message, product catalog or custom local storage
     *
     * @param payload file path or attachment source
     *
     * @throws {ZaloApiError | ZaloApiMissingImageMetadataGetter}
     */
    return async function uploadProductPhoto(payload) {
        const isSourceFilePath = typeof payload.file == "string";
        const fileMetaData = isSourceFilePath
            ? await utils.getImageMetaData(ctx, payload.file)
            : payload.file.metadata;
        const fileSize = fileMetaData.totalSize || 0;
        const fileBuffer = isSourceFilePath
            ? await fs.promises.readFile(payload.file)
            : payload.file.data;
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
        const encryptedParams = utils$1.encodeAES(JSON.stringify(params));
        if (!encryptedParams)
            throw new ZaloApiError.ZaloApiError("Failed to encrypt params");
        const response = await utils$1.request(utils$1.makeURL(serviceURL, {
            params: encryptedParams,
        }), {
            method: "POST",
            headers: formData.getHeaders(),
            body: formData.getBuffer(),
        });
        return utils$1.resolve(response);
    };
});

exports.uploadProductPhotoFactory = uploadProductPhotoFactory;
