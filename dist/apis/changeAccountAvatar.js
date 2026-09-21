import FormData from "form-data";
import fs from "node:fs";
import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory, formatTime, getImageMetaData } from "../utils.js";
export const changeAccountAvatarFactory = apiFactory()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.file[0]}/api/profile/upavatar`);
    /**
     * Change account avatar
     *
     * @param avatarSource Attachment source, can be a file path or an Attachment object
     *
     * @throws {ZaloApiError | ZaloApiMissingImageMetadataGetter}
     */
    return async function changeAccountAvatar(avatarSource) {
        const isSourceFilePath = typeof avatarSource == "string";
        const imageMetaData = isSourceFilePath ? await getImageMetaData(ctx, avatarSource) : avatarSource.metadata;
        const fileSize = imageMetaData.totalSize || 0;
        const params = {
            avatarSize: 120,
            clientId: String(ctx.uid + formatTime("%H:%M %d/%m/%Y")),
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
        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams)
            throw new ZaloApiError("Failed to encrypt params");
        const response = await utils.request(utils.makeURL(serviceURL, {
            params: encryptedParams,
        }), {
            method: "POST",
            headers: formData.getHeaders(),
            body: formData.getBuffer(),
        });
        return utils.resolve(response);
    };
});
