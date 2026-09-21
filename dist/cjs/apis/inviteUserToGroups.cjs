'use strict';

var ZaloApiError = require('../Errors/ZaloApiError.cjs');
var utils = require('../utils.cjs');

const inviteUserToGroupsFactory = utils.apiFactory()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.group[0]}/api/group/invite/multi`);
    /**
     * Invite user to group
     *
     * @param groupId group ID(s)
     * @param memberId member ID
     *
     * @throws {ZaloApiError}
     *
     */
    return async function inviteUserToGroups(userId, groupId) {
        const params = {
            grids: Array.isArray(groupId) ? groupId : [groupId],
            member: userId,
            memberType: -1,
            srcInteraction: 2,
            clientLang: ctx.language,
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

exports.inviteUserToGroupsFactory = inviteUserToGroupsFactory;
