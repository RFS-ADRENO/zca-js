'use strict';

var FormData = require('form-data');
var fs = require('node:fs');
var ZaloApiError = require('../Errors/ZaloApiError.cjs');
var utils = require('../utils.cjs');

const changeAccountAvatarFactory = utils.apiFactory()((api, ctx, utils$1) => {
    const serviceURL = utils$1.makeURL(`${api.zpwServiceMap.file[0]}/api/profile/upavatar`);
    /**
     * Change account avatar
     *
     * @param avatarSource Attachment source, can be a file path or an Attachment object
     *
     * @throws {ZaloApiError | ZaloApiMissingImageMetadataGetter}
     */
    return async function changeAccountAvatar(avatarSource) {
        const isSourceFilePath = typeof avatarSource == "string";
        const imageMetaData = isSourceFilePath ? await utils.getImageMetaData(ctx, avatarSource) : avatarSource.metadata;
        const fileSize = imageMetaData.totalSize || 0;
        const params = {
            avatarSize: 120,
            clientId: String(ctx.uid + utils.formatTime("%H:%M %d/%m/%Y")),
            language: ctx.language,
            metaData: JSON.stringify({
                origin: {
                    width: imageMetaData.width || 1080,
                    height: imageMetaData.height || 1080,
                },
                processed: {
                    width: imageMetaData.width || 1080,
                    height: imageMetaData.height || 1080,
                    size: fileSize,
                },
            }),
        };
        const avatarData = isSourceFilePath ? fs.readFileSync(avatarSource) : avatarSource.data;
        const formData = new FormData();
        formData.append("fileContent", avatarData, {
            filename: "blob",
            contentType: "image/jpeg",
        });
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

exports.changeAccountAvatarFactory = changeAccountAvatarFactory;
