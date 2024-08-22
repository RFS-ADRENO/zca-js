import { appContext } from "../context.js";
import { encodeAES, request, getImageMetaData, getFullTimeFromMilisecond, decodeAES } from "../utils.js";
import FormData from "form-data";
import fs from "node:fs";

export type ChangeGroupAvatarResponse = "" | null;

export function changeGroupAvatarFactory(serviceURL: string) {
    /**
     * Change group avatar
     *
     * @param groupId Group ID
     * @param avatarPath Path to the image file
     * 
     * @returns empty string if success, null if failed
     */
    return async function changeGroupAvatar(groupId: string, avatarPath: string) {
        if (!appContext.secretKey) throw new Error("Secret key is not available");
        if (!appContext.imei) throw new Error("IMEI is not available");
        if (!appContext.cookie) throw new Error("Cookie is not available");
        if (!appContext.userAgent) throw new Error("User agent is not available");

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
        if (!encryptedParams) throw new Error("Failed to encrypt params");

        const response = await request(serviceURL + `&params=${encodeURIComponent(encryptedParams)}`, {
            method: "POST",
            headers: formData.getHeaders(),
            body: formData.getBuffer(),
        });

        if (!response.ok) throw new Error("Failed to upload avatar: " + response.statusText);

        const responseJson = await response.json();

        const decoded = decodeAES(appContext.secretKey, responseJson.data);

        if (!decoded) throw new Error("Failed to decode message");

        return JSON.parse(decoded).data as ChangeGroupAvatarResponse;
    };
}
