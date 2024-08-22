import { appContext } from "../context.js";
import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { encodeAES, handleZaloResponse, request } from "../utils.js";

export type ChangeGroupNameResponse = {
    status: number;
};

export function changeGroupNameFactory(serviceURL: string) {
    /**
     * Change group name
     *
     * @param groupId Group ID
     * @param name New group name
     * 
     * @throws ZaloApiError
     */
    return async function changeGroupName(groupId: string, name: string) {
        if (!appContext.secretKey) throw new ZaloApiError("Secret key is not available");
        if (!appContext.imei) throw new ZaloApiError("IMEI is not available");
        if (!appContext.cookie) throw new ZaloApiError("Cookie is not available");
        if (!appContext.userAgent) throw new ZaloApiError("User agent is not available");

        if (name.length == 0) name = Date.now().toString();

        const params: any = {
            grid: groupId,
            gname: name,
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

        const result = await handleZaloResponse<ChangeGroupNameResponse>(response);
        if (result.error) throw new ZaloApiError(result.error.message, result.error.code);

        return result.data as ChangeGroupNameResponse;
    };
}
