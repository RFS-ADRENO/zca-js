import { Zalo } from "../zalo.js";
import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { appContext } from "../context.js";
import { encodeAES, handleZaloResponse, request } from "../utils.js";

export type GroupInfo = {
    groupId: string;
    groupName: string;
    groupDescription?: string;
    membersCount: number;
    [key: string]: any;
};

export type FetchGroupInfoResponse = {
    data: GroupInfo[];
    error?: {
        code: number;
        message: string;
    };
};

export function fetchGroupInfoFactory(serviceURL: string) {
    return async function fetchGroupInfo(groupId: string | number | Record<string, any>) {
        if (!appContext.secretKey) throw new ZaloApiError("Secret key is not available");
        if (!appContext.imei) throw new ZaloApiError("IMEI is not available");
        if (!appContext.cookie) throw new ZaloApiError("Cookie is not available");
        if (!appContext.userAgent) throw new ZaloApiError("User agent is not available");

        const params: any = {
            params: {
                gridVerMap: {}
            },
            zpw_ver: Zalo.API_VERSION,
            zpw_type: Zalo.API_TYPE
        };
        
        if (typeof groupId === 'object') {
            for (const i in groupId) {
                if (groupId.hasOwnProperty(i)) {
                    params.params.gridVerMap[String(i)] = 0;
                }
            }
        } else {
            params.params.gridVerMap[String(groupId)] = 0;
        }
        
        params.params.gridVerMap = JSON.stringify(params.params.gridVerMap);
        const encryptedParams = encodeAES(appContext.secretKey, JSON.stringify(params));
        
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await request(serviceURL, {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });

        const result = await handleZaloResponse<FetchGroupInfoResponse>(response);
        if (result.error) throw new ZaloApiError(result.error.message, result.error.code);

        return result.data;
    };
}
