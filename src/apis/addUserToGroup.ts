import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type AddUserToGroupResponse = {
    errorMemebers: string[];
    error_data: Record<string, any>;
};

export const addUserToGroupFactory = apiFactory<AddUserToGroupResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.group[0]}/api/group/invite/v2`);

    /**
     * Add user to existing group
     *
     * @param groupId Group ID
     * @param members User ID or list of user IDs to add
     *
     * @throws ZaloApiError
     */
    return async function addUserToGroup(groupId: string, members: string | string[]) {
        if (!Array.isArray(members)) members = [members];

        const params: any = {
            grid: groupId,
            members: members,
            membersTypes: members.map(() => -1),
            imei: ctx.imei,
            clientLang: ctx.language,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(serviceURL, {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });

        return utils.resolve(response);
    };
});
