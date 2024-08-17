import { appContext } from "../context.js";
import { encodeAES, request } from "../utils.js";

export function addUserToGroupFactory(serviceURL: string) {
    /**
     * Add user to existing group
     *
     * @param groupId Group ID
     * @param members User ID or list of user IDs to add
     */
    return async function addUserToGroup(groupId: string, members: string | string[]) {
        if (!appContext.secretKey) throw new Error("Secret key is not available");
        if (!appContext.imei) throw new Error("IMEI is not available");
        if (!appContext.cookie) throw new Error("Cookie is not available");
        if (!appContext.userAgent) throw new Error("User agent is not available");

        if (!Array.isArray(members)) members = [members];

        const params: any = {
            grid: groupId,
            members: members,
            membersTypes: members.map(() => -1),
            imei: appContext.imei,
            clientLang: appContext.language,
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
