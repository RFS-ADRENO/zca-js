'use strict';

var FormData = require('form-data');
var fs = require('node:fs');
var ZaloApiError = require('../Errors/ZaloApiError.cjs');
var Enum = require('../models/Enum.cjs');
require('../models/FriendEvent.cjs');
require('../models/GroupEvent.cjs');
require('../models/Reaction.cjs');
var utils = require('../utils.cjs');

const urlType = {
    image: "photo_original/upload",
    video: "asyncfile/upload",
    others: "asyncfile/upload",
};
const uploadAttachmentFactory = utils.apiFactory()((api, ctx, utils$1) => {
    const serviceURL = `${api.zpwServiceMap.file[0]}/api`;
    const { sharefile } = ctx.settings.features;
    function isExceedMaxFile(totalFile) {
        return totalFile > sharefile.max_file;
    }
    function isExceedMaxFileSize(fileSize) {
        return fileSize > sharefile.max_size_share_file_v3 * 1024 * 1024;
    }
    function isExtensionValid(ext) {
        return sharefile.restricted_ext_file.indexOf(ext) == -1;
    }
    /**
     * Upload an attachment to a thread
     *
     * @param filePaths Path to the file
     * @param threadId Group or User ID
     * @param type Message type (User or Group)
     *
     * @throws ZaloApiError
     */
    return async function uploadAttachment(filePaths, threadId, type = Enum.ThreadType.User) {
        if (!filePaths || filePaths.length == 0)
            throw new ZaloApiError.ZaloApiError("Missing filePaths");
        if (isExceedMaxFile(filePaths.length))
            throw new ZaloApiError.ZaloApiError("Exceed maximum file of " + sharefile.max_file);
        if (!threadId)
            throw new ZaloApiError.ZaloApiError("Missing threadId");
        const chunkSize = ctx.settings.features.sharefile.chunk_size_file;
        const isGroupMessage = type == Enum.ThreadType.Group;
        let attachmentsData = [];
        let url = `${serviceURL}/${isGroupMessage ? "group" : "message"}/`;
        const typeParam = isGroupMessage ? "11" : "2";
        let clientId = Date.now();
        for (const filePath of filePaths) {
            if (!fs.existsSync(filePath))
                throw new ZaloApiError.ZaloApiError("File not found");
            const extFile = utils.getFileExtension(filePath);
            const fileName = utils.getFileName(filePath);
            if (isExtensionValid(extFile) == false)
                throw new ZaloApiError.ZaloApiError(`File extension "${extFile}" is not allowed`);
            const data = {
                filePath,
                chunkContent: [],
                params: {},
            };
            if (isGroupMessage)
                data.params.grid = threadId;
            else
                data.params.toid = threadId;
            switch (extFile) {
                case "jpg":
                case "jpeg":
                case "png":
                case "webp":
                    let imageData = await utils.getImageMetaData(filePath);
                    if (isExceedMaxFileSize(imageData.totalSize))
                        throw new ZaloApiError.ZaloApiError(`File ${fileName} size exceed maximum size of ${sharefile.max_size_share_file_v3}MB`);
                    data.fileData = imageData;
                    data.fileType = "image";
                    data.params.totalChunk = Math.ceil(data.fileData.totalSize / chunkSize);
                    data.params.fileName = fileName;
                    data.params.clientId = clientId++;
                    data.params.totalSize = imageData.totalSize;
                    data.params.imei = ctx.imei;
                    data.params.isE2EE = 0;
                    data.params.jxl = 0;
                    data.params.chunkId = 1;
                    break;
                case "mp4":
                    let videoSize = await utils.getFileSize(filePath);
                    if (isExceedMaxFileSize(videoSize))
                        throw new ZaloApiError.ZaloApiError(`File ${fileName} size exceed maximum size of ${sharefile.max_size_share_file_v3}MB`);
                    data.fileType = "video";
                    data.fileData = {
                        fileName,
                        totalSize: videoSize,
                    };
                    data.params.totalChunk = Math.ceil(data.fileData.totalSize / chunkSize);
                    data.params.fileName = fileName;
                    data.params.clientId = clientId++;
                    data.params.totalSize = videoSize;
                    data.params.imei = ctx.imei;
                    data.params.isE2EE = 0;
                    data.params.jxl = 0;
                    data.params.chunkId = 1;
                    break;
                default:
                    const fileSize = await utils.getFileSize(filePath);
                    if (isExceedMaxFileSize(fileSize))
                        throw new ZaloApiError.ZaloApiError(`File ${fileName} size exceed maximum size of ${sharefile.max_size_share_file_v3}MB`);
                    data.fileType = "others";
                    data.fileData = {
                        fileName,
                        totalSize: fileSize,
                    };
                    data.params.totalChunk = Math.ceil(data.fileData.totalSize / chunkSize);
                    data.params.fileName = fileName;
                    data.params.clientId = clientId++;
                    data.params.totalSize = fileSize;
                    data.params.imei = ctx.imei;
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
        const requests = [], results = [];
        for (const data of attachmentsData) {
            for (let i = 0; i < data.params.totalChunk; i++) {
                const encryptedParams = utils$1.encodeAES(JSON.stringify(data.params));
                if (!encryptedParams)
                    throw new ZaloApiError.ZaloApiError("Failed to encrypt message");
                requests.push(utils$1
                    .request(utils$1.makeURL(url + urlType[data.fileType], { type: typeParam, params: encryptedParams }), {
                    method: "POST",
                    headers: data.chunkContent[i].getHeaders(),
                    body: data.chunkContent[i].getBuffer(),
                })
                    .then(async (response) => {
                    /**
                     * @todo better type rather than any
                     */
                    const resData = await utils.resolveResponse(ctx, response);
                    if (resData && resData.fileId != -1 && resData.photoId != -1)
                        await new Promise((resolve) => {
                            if (data.fileType == "video" || data.fileType == "others") {
                                const uploadCallback = async (wsData) => {
                                    let result = Object.assign(Object.assign(Object.assign({ fileType: data.fileType }, resData), wsData), { totalSize: data.fileData.totalSize, fileName: data.fileData.fileName, checksum: (await utils.getMd5LargeFileObject(data.filePath, data.fileData.totalSize)).data });
                                    results.push(result);
                                    resolve();
                                };
                                ctx.uploadCallbacks.set(resData.fileId, uploadCallback);
                            }
                            if (data.fileType == "image") {
                                let result = Object.assign({ fileType: "image", width: data.fileData.width, height: data.fileData.height, totalSize: data.fileData.totalSize, hdSize: data.fileData.totalSize }, resData);
                                results.push(result);
                                resolve();
                            }
                        });
                }));
                data.params.chunkId++;
            }
        }
        await Promise.all(requests);
        return results;
    };
});

exports.uploadAttachmentFactory = uploadAttachmentFactory;
