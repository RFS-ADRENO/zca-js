import fs from "node:fs";
import FormData from "form-data";
import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory, getFileName, getFileSize, formatTime, getImageMetaData } from "../utils.js";
import type { AttachmentSource } from "../models/Attachment.js";

export type ChangeAccountAvatarResponse = "";

export const changeAccountAvatarFactory = apiFactory<ChangeAccountAvatarResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.file[0]}/api/profile/upavatar`);
    const { sharefile } = ctx.settings!.features;

    function isExceedMaxFileSize(fileSize: number) {
        return fileSize > sharefile.max_size_share_file_v3 * 1024 * 1024;
    }

    /**
     * Change account avatar
     *
     * @param userId User ID of account want to change avatar
     * @param source image source (file path or Buffer)
     *
     * @throws ZaloApiError
     */
    return async function changeAccountAvatar(
        userId: string,
        source: AttachmentSource,
    ) {
        const isSourceFilePath = typeof source === "string";
        if (isSourceFilePath && !fs.existsSync(source)) {
            throw new ZaloApiError(`${source} not found`);
        }

        const fileName = isSourceFilePath ? getFileName(source) : source.filename;
        const fileSize = isSourceFilePath ? (await getFileSize(source)) : source.metadata.totalSize;

        if (isExceedMaxFileSize(fileSize))
            throw new ZaloApiError(
                `File ${fileName} size exceed maximum size of ${sharefile.max_size_share_file_v3}MB`,
            );

        const fileContent = isSourceFilePath ? (await fs.promises.readFile(source)) : source.data;
        const metadata = isSourceFilePath ? (await getImageMetaData(source)) : source.metadata;

        const params = {
            avatarSize: 120,
            clientId: String(userId + formatTime("%H:%M %d/%m/%Y")),
            language: ctx.language,
            metaData: JSON.stringify({
                origin: {
                    width: metadata.width,
                    height: metadata.height,
                },
                processed: {
                    width: metadata.width,
                    height: metadata.height,
                    size: metadata.totalSize,
                },
            }),
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const formData = new FormData();
        formData.append("params", encryptedParams);
        formData.append("fileContent", fileContent, {
            filename: fileName,
            contentType: "image/jpg",
        });

        const response = await utils.request(serviceURL, {
            method: "POST",
            body: formData as any,
        });

        return utils.resolve(response);
    };
});
