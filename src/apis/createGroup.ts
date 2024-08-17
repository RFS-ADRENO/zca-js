import { appContext } from "../context.js";
import { API } from "../index.js";
import { decodeAES, encodeAES, request } from "../utils.js";

export function createGroupFactory(serviceURL: string, api: API) {
    /**
     * Create a new group
     *
     * @param options Group options
     */
    return async function createGroup(options: { name?: string; members: string[]; avatarPath?: string }) {
        if (!appContext.secretKey) throw new Error("Secret key is not available");
        if (!appContext.imei) throw new Error("IMEI is not available");
        if (!appContext.cookie) throw new Error("Cookie is not available");
        if (!appContext.userAgent) throw new Error("User agent is not available");

        if (options.members.length == 0) throw new Error("Group must have at least one member");

        const params: any = {
            clientId: Date.now(),
            gname: String(Date.now()),
            gdesc: null,
            members: options.members,
            membersTypes: options.members.map(() => -1),
            nameChanged: 0,
            createLink: 1,
            clientLang: appContext.language,
            imei: appContext.imei,
            zsource: 601,
        };

        if (options.name && options.name.length > 0) {
            params.gname = options.name;
            params.nameChanged = 1;
        }

        const encryptedParams = encodeAES(appContext.secretKey, JSON.stringify(params));
        if (!encryptedParams) throw new Error("Failed to encrypt message");

        const response = await request(serviceURL + `&params=${encodeURIComponent(encryptedParams)}`, {
            method: "POST",
        });

        if (!response.ok) throw new Error("Failed to send message: " + response.statusText);

        const decoded = decodeAES(appContext.secretKey, (await response.json()).data);

        if (!decoded) throw new Error("Failed to decode message");

        let data = JSON.parse(decoded).data;

        if (options.avatarPath) await api.changeGroupAvatar(data.groupId, options.avatarPath);

        return data;
    };
}
