'use strict';

var FormData = require('form-data');
var fs = require('node:fs');
var ZaloApiError = require('../Errors/ZaloApiError.cjs');
require('../models/AutoReply.cjs');
require('../models/Bank.cjs');
require('../models/Board.cjs');
var Enum = require('../models/Enum.cjs');
require('../models/FriendEvent.cjs');
require('../models/Group.cjs');
require('../models/GroupEvent.cjs');
require('../models/Reaction.cjs');
require('../models/Reminder.cjs');
require('../models/ZBusiness.cjs');
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
     * @param sources path to files or attachment sources
     * @param threadId Group or User ID
     * @param type Message type (User or Group)
     *
     * @throws {ZaloApiError | ZaloApiMissingImageMetadataGetter}
     */
    return async function uploadAttachment(sources, threadId, type = Enum.ThreadType.User) {
        if (!sources)
            throw new ZaloApiError.ZaloApiError("Missing sources");
        if (!Array.isArray(sources))
            sources = [sources];
        if (sources.length == 0)
            throw new ZaloApiError.ZaloApiError("Missing sources");
        if (isExceedMaxFile(sources.length))
            throw new ZaloApiError.ZaloApiError("Exceed maximum file of " + sharefile.max_file);
        if (!threadId)
            throw new ZaloApiError.ZaloApiError("Missing threadId");
        const chunkSize = ctx.settings.features.sharefile.chunk_size_file;
        const isGroupMessage = type == Enum.ThreadType.Group;
        const attachmentsData = [];
        const url = `${serviceURL}/${isGroupMessage ? "group" : "message"}/`;
        const typeParam = isGroupMessage ? "11" : "2";
        let clientId = Date.now();
        for (const source of sources) {
            const isFilePath = typeof source == "string";
            const isBuffer = typeof source == "object" && source.data instanceof Buffer;
            if (!isFilePath && !isBuffer)
                throw new ZaloApiError.ZaloApiError("Invalid source type");
            if (!isFilePath && !source.filename)
                throw new ZaloApiError.ZaloApiError("Missing filename");
            if (isFilePath && !fs.existsSync(source))
                throw new ZaloApiError.ZaloApiError("File not found");
            const extFile = utils.getFileExtension(isFilePath ? source : source.filename).toLowerCase();
            const fileName = isFilePath ? utils.getFileName(source) : source.filename;
            if (isExtensionValid(extFile) == false)
                throw new ZaloApiError.ZaloApiError(`File extension "${extFile}" is not allowed`);
            const data = {
                filePath: isFilePath ? source : source.filename,
                chunkContent: [],
                params: {},
                source,
            };
            if (isGroupMessage)
                data.params.grid = threadId;
            else
                data.params.toid = threadId;
            switch (extFile) {
                case "jpg":
                case "jpeg":
                case "png":
                case "webp": {
                    const imageData = isFilePath ? await utils.getImageMetaData(ctx, source) : Object.assign(Object.assign({}, source.metadata), { fileName });
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
                }
                case "mp4": {
                    const videoSize = isFilePath ? await utils.getFileSize(source) : source.metadata.totalSize;
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
                }
                default: {
                    const fileSize = isFilePath ? await utils.getFileSize(source) : source.metadata.totalSize;
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
            }
            const fileBuffer = isFilePath ? await fs.promises.readFile(source) : source.data;
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
        for (let atmIndex = 0; atmIndex < attachmentsData.length; atmIndex++) {
            const data = attachmentsData[atmIndex];
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
                     * @TODO: better type rather than any
                     */
                    const resData = await utils.resolveResponse(ctx, response);
                    if (resData && resData.fileId != "-1" && resData.photoId != "-1")
                        await new Promise((resolve) => {
                            if (data.fileType == "video" || data.fileType == "others") {
                                const uploadCallback = async (wsData) => {
                                    const result = Object.assign(Object.assign(Object.assign({ fileType: data.fileType }, resData), wsData), { totalSize: data.fileData.totalSize, fileName: data.fileData.fileName, checksum: (await utils.getMd5LargeFileObject(data.source, data.fileData.totalSize)).data });
                                    results[atmIndex] = result;
                                    resolve();
                                };
                                ctx.uploadCallbacks.set(resData.fileId.toString(), uploadCallback);
                            }
                            if (data.fileType == "image") {
                                const result = {
                                    fileType: "image",
                                    width: data.fileData.width,
                                    height: data.fileData.height,
                                    totalSize: data.fileData.totalSize,
                                    hdSize: data.fileData.totalSize,
                                    finished: resData.finished,
                                    normalUrl: resData.normalUrl,
                                    hdUrl: resData.hdUrl,
                                    thumbUrl: resData.thumbUrl,
                                    chunkId: resData.chunkId,
                                    photoId: resData.photoId,
                                    clientFileId: resData.clientFileId,
                                };
                                results[atmIndex] = result;
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
