import { appContext } from "../context.js";
import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { encodeAES, handleZaloResponse, request } from "../utils.js";
import type { API } from "../zalo.js";

export type CreateGroupResponse = {
    groupType: number;
    sucessMembers: string[];
    groupId: string;
    errorMembers: string[];
    error_data: Record<string, any>;
};

export function createGroupFactory(serviceURL: string, api: API) {
    /**
     * Create a new group
     *
     * @param options Group options
     *
     * @throws ZaloApiError
     */
    return async function createGroup(options: { name?: string; members: string[]; avatarPath?: string }) {
        if (!appContext.secretKey) throw new ZaloApiError("Secret key is not available");
        if (!appContext.imei) throw new ZaloApiError("IMEI is not available");
        if (!appContext.cookie) throw new ZaloApiError("Cookie is not available");
        if (!appContext.userAgent) throw new ZaloApiError("User agent is not available");

        if (options.members.length == 0) throw new ZaloApiError("Group must have at least one member");

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
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt message");

        const response = await request(serviceURL + `&params=${encodeURIComponent(encryptedParams)}`, {
            method: "POST",
        });

        const createGroupResult = await handleZaloResponse<CreateGroupResponse>(response);

        if (createGroupResult.error)
            throw new ZaloApiError(createGroupResult.error.message, createGroupResult.error.code);

        const data = createGroupResult.data as CreateGroupResponse;

        if (options.avatarPath) await api.changeGroupAvatar(data.groupId, options.avatarPath).catch(console.error);

        return data;
    };
}
