'use strict';

var fs = require('node:fs');
var FormData = require('form-data');
var ZaloApiError = require('../Errors/ZaloApiError.cjs');
var utils = require('../utils.cjs');

const changeAccountAvatarFactory = utils.apiFactory()((api, ctx, utils$1) => {
    const serviceURL = utils$1.makeURL(`${api.zpwServiceMap.file[0]}/api/profile/upavatar`);
    const { sharefile } = ctx.settings.features;
    function isExceedMaxFileSize(fileSize) {
        return fileSize > sharefile.max_size_share_file_v3 * 1024 * 1024;
    }
    /**
     * Change account avatar
     *
     * @param userId User ID of account want to change avatar
     * @param filePath A path to the image to upload/change avatar
     * @param width  Width of avatar image
     * @param height Height of avatar image
     * @param language Zalo website language ? (idk) <(") || (default is vi = Vietnamese) || (en = English, my = Malaysia)
     * @param size Avatar image size (default = auto)
     *
     * @throws ZaloApiError
     */
    return async function changeAccountAvatar(userId, filePath, width = 500, height = 500, language = "vi", size = null) {
        if (!fs.existsSync(filePath)) {
            throw new ZaloApiError.ZaloApiError(`${filePath} not found`);
        }
        const fileName = utils.getFileName(filePath);
        const fileSize = size || (await utils.getFileSize(filePath)); // (await fs.promises.stat(filePath)).size
        if (isExceedMaxFileSize(fileSize))
            throw new ZaloApiError.ZaloApiError(`File ${fileName} size exceed maximum size of ${sharefile.max_size_share_file_v3}MB`);
        const fileContent = await fs.promises.readFile(filePath);
        // const files: [string, Buffer][] = [["fileContent", fileContent]];
        const params = {
            avatarSize: 120,
            clientId: String(userId + utils.formatTime("%H:%M %d/%m/%Y")),
            language: language,
            metaData: JSON.stringify({
                origin: {
                    width: width,
                    height: height,
                },
                processed: {
                    width: width,
                    height: height,
                    size: Number(fileSize),
                },
            }),
        };
        const encryptedParams = utils$1.encodeAES(JSON.stringify(params));
        if (!encryptedParams)
            throw new ZaloApiError.ZaloApiError("Failed to encrypt params");
        const formData = new FormData();
        formData.append("params", encryptedParams);
        // formData.append("fileContent", files);
        formData.append("fileContent", fileContent, {
            filename: fileName,
            contentType: "image/jpg", // Cần xác định type nếu có
        });
        const response = await utils$1.request(serviceURL, {
            method: "POST",
            body: formData,
        });
        return utils$1.resolve(response);
    };
});

exports.changeAccountAvatarFactory = changeAccountAvatarFactory;
