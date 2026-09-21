'use strict';

var ZaloApiError = require('../Errors/ZaloApiError.cjs');
var utils = require('../utils.cjs');

const deleteGroupInviteBoxFactory = utils.apiFactory()((api, _, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.group[0]}/api/group/inv-box/mdel-inv`);
    /**
     * Delete group invite box
     *
     * @param groupId - The group id
     * @param blockFutureInvite - Whether to block future invites from this group
     *
     * @throws {ZaloApiError}
     */
    return async function deleteGroupInviteBox(groupId, blockFutureInvite = false) {
        const grids = Array.isArray(groupId) ? groupId : [groupId];
        const params = {
            invitations: JSON.stringify(grids.map((grid) => ({ grid }))),
            block: blockFutureInvite ? 1 : 0,
        };
        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams)
            throw new ZaloApiError.ZaloApiError("Failed to encrypt params");
        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
            method: "GET",
        });
        return utils.resolve(response);
    };
});

exports.deleteGroupInviteBoxFactory = deleteGroupInviteBoxFactory;
