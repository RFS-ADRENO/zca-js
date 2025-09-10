import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type LeaveGroupResponse = {
    memberError: unknown[];
};

export const leaveGroupFactory = apiFactory<LeaveGroupResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.group[0]}/api/group/leave`);

    /**
     * Leave group
     *
     * @param groupId - groupId to leave
     * @param silent - Turn on/off silent leave group
     *
     * @note Zalo might throw an error with code 166 if you are not a member of the group
     *
     * @throws ZaloApiError
     */
    return async function leaveGroup(groupId: string, silent: boolean = false) {
        const requestParams = {
            grids: [groupId], // API only supports leaving one group at a time
            imei: ctx.imei,
            silent: silent ? 1 : 0,
            language: ctx.language,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(requestParams));
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
