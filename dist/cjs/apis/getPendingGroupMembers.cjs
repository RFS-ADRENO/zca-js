'use strict';

var ZaloApiError = require('../Errors/ZaloApiError.cjs');
var utils = require('../utils.cjs');

const getPendingGroupMembersFactory = utils.apiFactory()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.group[0]}/api/group/pending-mems/list`);
    /**
     * Get pending group members
     *
     * @param groupId - The id of the group to get the pending members
     *
     * @note Only the group leader and deputy group leader can view
     *
     * @throws {ZaloApiError}
     */
    return async function getPendingGroupMembers(groupId) {
        const params = {
            grid: groupId,
            imei: ctx.imei,
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

exports.getPendingGroupMembersFactory = getPendingGroupMembersFactory;
