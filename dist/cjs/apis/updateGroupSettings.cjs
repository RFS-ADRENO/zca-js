'use strict';

var ZaloApiError = require('../Errors/ZaloApiError.cjs');
var utils = require('../utils.cjs');

const updateGroupSettingsFactory = utils.apiFactory()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.group[0]}/api/group/setting/update`);
    /**
     * Update group settings
     *
     * @param options Options
     * @param groupId Group ID
     *
     * @throws ZaloApiError
     */
    return async function updateGroupSettings(options, groupId) {
        const params = {
            blockName: options.blockName ? 0 : 1,
            signAdminMsg: options.signAdminMsg ? 1 : 0,
            addMemberOnly: options.addMemberOnly ? 0 : 1,
            setTopicOnly: options.setTopicOnly ? 0 : 1,
            enableMsgHistory: options.enableMsgHistory ? 1 : 0,
            joinAppr: options.joinAppr ? 1 : 0,
            lockCreatePost: options.lockCreatePost ? 0 : 1,
            lockCreatePoll: options.lockCreatePoll ? 0 : 1,
            lockSendMsg: options.lockSendMsg ? 0 : 1,
            lockViewMember: options.lockViewMember ? 1 : 0,
            bannFeature: options.bannFeature ? 1 : 0,
            // dirtyMedia: options.dirtyMedia ? 1 : 0, // not see
            // banDuration: options.banDuration ? 1 : 0, // not see
            // blocked_members: [], not implemented
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

exports.updateGroupSettingsFactory = updateGroupSettingsFactory;
