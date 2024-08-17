import { appContext } from "../context.js";
import { encodeAES, request } from "../utils.js";

export function changeGroupNameFactory(serviceURL: string) {
    /**
     * Change group name
     *
     * @param groupId Group ID
     * @param name New group name
     */
    return async function changeGroupName(groupId: string, name: string) {
        if (!appContext.secretKey) throw new Error("Secret key is not available");
        if (!appContext.imei) throw new Error("IMEI is not available");
        if (!appContext.cookie) throw new Error("Cookie is not available");
        if (!appContext.userAgent) throw new Error("User agent is not available");

        if (name.length == 0) name = Date.now().toString();

        const params: any = {
            grid: groupId,
            gname: name,
            imei: appContext.imei,
        };

        const encryptedParams = encodeAES(appContext.secretKey, JSON.stringify(params));
        if (!encryptedParams) throw new Error("Failed to encrypt params");

        const response = await request(serviceURL, {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });

        if (!response.ok) throw new Error("Failed to add user to group: " + response.statusText);

        return (await response.json()).data;
    };
}
