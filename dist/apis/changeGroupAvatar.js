import FormData from "form-data";
import fs from "node:fs";
import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory, getFullTimeFromMillisecond, getImageMetaData } from "../utils.js";
export const changeGroupAvatarFactory = apiFactory()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.file[0]}/api/group/upavatar`);
    /**
     * Change group avatar
     *
     * @param avatarPath Path to the image file
     * @param groupId Group ID
     *
     * @throws ZaloApiError
     */
    return async function changeGroupAvatar(avatarPath, groupId) {
        const params = {
            grid: groupId,
            avatarSize: 120,
            clientId: `g${groupId}${getFullTimeFromMillisecond(new Date().getTime())}`,
            imei: ctx.imei,
        };
        const imageMetaData = await getImageMetaData(avatarPath);
        params.originWidth = imageMetaData.width || 1080;
        params.originHeight = imageMetaData.height || 1080;
        const formData = new FormData();
        formData.append("fileContent", fs.readFileSync(avatarPath), {
            filename: "blob",
            contentType: "image/jpeg",
        });
        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams)
            throw new ZaloApiError("Failed to encrypt params");
        const response = await utils.request(serviceURL + `&params=${encodeURIComponent(encryptedParams)}`, {
            method: "POST",
            headers: formData.getHeaders(),
            body: formData.getBuffer(),
        });
        return utils.resolve(response);
    };
});
