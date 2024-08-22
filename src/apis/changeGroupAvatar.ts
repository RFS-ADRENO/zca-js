import FormData from "form-data";
import fs from "node:fs";
import { appContext } from "../context.js";
import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { encodeAES, getFullTimeFromMilisecond, getImageMetaData, handleZaloResponse, request } from "../utils.js";

export type ChangeGroupAvatarResponse = "";

export function changeGroupAvatarFactory(serviceURL: string) {
    /**
     * Change group avatar
     *
     * @param groupId Group ID
     * @param avatarPath Path to the image file
     *
     * @throws ZaloApiError
     */
    return async function changeGroupAvatar(groupId: string, avatarPath: string) {
        if (!appContext.secretKey) throw new ZaloApiError("Secret key is not available");
        if (!appContext.imei) throw new ZaloApiError("IMEI is not available");
        if (!appContext.cookie) throw new ZaloApiError("Cookie is not available");
        if (!appContext.userAgent) throw new ZaloApiError("User agent is not available");

        const params: any = {
            grid: groupId,
            avatarSize: 120,
            clientId: `g${groupId}${getFullTimeFromMilisecond(new Date().getTime())}`,
            imei: appContext.imei,
        };

        const imageMetaData = await getImageMetaData(avatarPath);

        params.originWidth = imageMetaData.width || 1080;
        params.originHeight = imageMetaData.height || 1080;

        const formData = new FormData();
        formData.append("fileContent", fs.readFileSync(avatarPath), {
            filename: "blob",
            contentType: "image/jpeg",
        });

        const encryptedParams = encodeAES(appContext.secretKey, JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await request(serviceURL + `&params=${encodeURIComponent(encryptedParams)}`, {
            method: "POST",
            headers: formData.getHeaders(),
            body: formData.getBuffer(),
        });

        const result = await handleZaloResponse<ChangeGroupAvatarResponse>(response);
        if (result.error) throw new ZaloApiError(result.error.message, result.error.code);

        return result.data as ChangeGroupAvatarResponse;
    };
}
