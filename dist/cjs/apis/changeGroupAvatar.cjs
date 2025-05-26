'use strict';

var FormData = require('form-data');
var fs = require('node:fs');
var ZaloApiError = require('../Errors/ZaloApiError.cjs');
var utils = require('../utils.cjs');

const changeGroupAvatarFactory = utils.apiFactory()((api, ctx, utils$1) => {
    const serviceURL = utils$1.makeURL(`${api.zpwServiceMap.file[0]}/api/group/upavatar`);
    /**
     * Change group avatar
     *
     * @param avatarSource Attachment source, can be a file path or an Attachment object
     * @param groupId Group ID
     *
     * @throws ZaloApiError
     */
    return async function changeGroupAvatar(avatarSource, groupId) {
        const params = {
            grid: groupId,
            avatarSize: 120,
            clientId: `g${groupId}${utils.getFullTimeFromMillisecond(new Date().getTime())}`,
            imei: ctx.imei,
        };
        const isSourceFilePath = typeof avatarSource == "string";
        const imageMetaData = isSourceFilePath ? await utils.getImageMetaData(avatarSource) : avatarSource.metadata;
        params.originWidth = imageMetaData.width || 1080;
        params.originHeight = imageMetaData.height || 1080;
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

exports.changeGroupAvatarFactory = changeGroupAvatarFactory;
