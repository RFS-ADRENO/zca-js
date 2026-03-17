import FormData from "form-data";
import fs from "node:fs";
import { ZaloApiError } from "../Errors/ZaloApiError.js";
import type { AttachmentSource } from "../models/index.js";
import { apiFactory, getFullTimeFromMillisecond, getImageMetaData } from "../utils.js";

export type ChangeGroupAvatarResponse = "";

export const changeGroupAvatarFactory = apiFactory<ChangeGroupAvatarResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.file[0]}/api/group/upavatar`);

    /**
     * Change group avatar
     *
     * @param avatarSource Attachment source, can be a file path or an Attachment object
     * @param groupId Group ID
     *
     * @throws {ZaloApiError | ZaloApiMissingImageMetadataGetter}
     */
    return async function changeGroupAvatar(avatarSource: AttachmentSource, groupId: string) {
        const params: Record<string, unknown> = {
            grid: groupId,
            avatarSize: 120,
            clientId: `g${groupId}${getFullTimeFromMillisecond(new Date().getTime())}`,
            imei: ctx.imei,
        };

        const isSourceFilePath = typeof avatarSource == "string";
        const imageMetaData = isSourceFilePath ? await getImageMetaData(ctx, avatarSource) : avatarSource.metadata;

        params.originWidth = imageMetaData.width || 1080;
        params.originHeight = imageMetaData.height || 1080;

        const avatarData = isSourceFilePath ? fs.readFileSync(avatarSource) : avatarSource.data;
        const formData = new FormData();
        formData.append("fileContent", avatarData, {
            filename: "blob",
            contentType: "image/jpeg",
        });

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
