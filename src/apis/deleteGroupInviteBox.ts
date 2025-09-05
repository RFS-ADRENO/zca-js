import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type DeleteGroupInviteBoxResponse = {
    delInvitaionIds: string[];
    errMap: {
        [key: string]: {
            err: number;
        };
    };
};

export const deleteGroupInviteBoxFactory = apiFactory<DeleteGroupInviteBoxResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.group[0]}/api/group/inv-box/mdel-inv`);

    /**
     * Delete group invite box
     *
     * @param groupId - The group id
     * @param blockFutureInvite - Whether to block future invites from this group
     *
     * @throws ZaloApiError
     */
    return async function deleteGroupInviteBox(groupId: string | string[], blockFutureInvite: boolean = false) {
        const grids = Array.isArray(groupId) ? groupId : [groupId];

        const params = {
            invitations: JSON.stringify(grids.map((grid) => ({ grid }))),
            block: blockFutureInvite ? 1 : 0,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
