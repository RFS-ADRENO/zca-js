'use strict';

var ZaloApiError = require('../Errors/ZaloApiError.cjs');
var utils = require('../utils.cjs');

const linkGroupInfoFactory = utils.apiFactory()((api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.group[0]}/api/group/link/ginfo`);
    /**
     * Get link group info
     *
     * @param link - The link group
     *
     * @throws ZaloApiError
     */
    return async function linkGroupInfo(link) {
        const params = {
            link: link,
            avatar_size: 120,
            member_avatar_size: 120,
            mpage: 1,
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

exports.linkGroupInfoFactory = linkGroupInfoFactory;
