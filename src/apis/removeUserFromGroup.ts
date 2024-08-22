import { appContext } from "../context.js";
import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { encodeAES, handleZaloResponse, request } from "../utils.js";

export type RemoveUserFromGroupResponse = {
    errorMembers: string[];
};

export function removeUserFromGroupFactory(serviceURL: string) {
    /**
     * Remove user from existing group
     *
     * @param groupId Group ID
     * @param members User ID or list of user IDs to remove
     *
     * @throws ZaloApiError
     */
    return async function removeUserFromGroup(groupId: string, members: string | string[]) {
        if (!appContext.secretKey) throw new ZaloApiError("Secret key is not available");
        if (!appContext.imei) throw new ZaloApiError("IMEI is not available");
        if (!appContext.cookie) throw new ZaloApiError("Cookie is not available");
        if (!appContext.userAgent) throw new ZaloApiError("User agent is not available");

        if (!Array.isArray(members)) members = [members];

        const params: any = {
            grid: groupId,
            members: members,
            imei: appContext.imei,
        };

        const encryptedParams = encodeAES(appContext.secretKey, JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await request(serviceURL, {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });

        const result = await handleZaloResponse<RemoveUserFromGroupResponse>(response);
        if (result.error) throw new ZaloApiError(result.error.message, result.error.code);

        return result.data as RemoveUserFromGroupResponse;
    };
}
