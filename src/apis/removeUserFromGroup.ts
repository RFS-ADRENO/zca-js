import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory, encodeAES, makeURL, request } from "../utils.js";

export type RemoveUserFromGroupResponse = {
    errorMembers: string[];
};

export const removeUserFromGroupFactory = apiFactory<RemoveUserFromGroupResponse>()((api, ctx, resolve) => {
    const serviceURL = makeURL(`${api.zpwServiceMap.group[0]}/api/group/kickout`);

    /**
     * Remove user from existing group
     *
     * @param groupId Group ID
     * @param members User ID or list of user IDs to remove
     *
     * @throws ZaloApiError
     */
    return async function removeUserFromGroup(groupId: string, members: string | string[]) {
        if (!Array.isArray(members)) members = [members];

        const params: any = {
            grid: groupId,
            members: members,
            imei: ctx.imei,
        };

        const encryptedParams = encodeAES(ctx.secretKey, JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await request(serviceURL, {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });

        return resolve(response);
    };
});
