'use strict';

var ZaloApiError = require('../Errors/ZaloApiError.cjs');
var utils = require('../utils.cjs');

const changeGroupNameFactory = utils.apiFactory()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.group[0]}/api/group/updateinfo`);
    /**
     * Change group name
     *
     * @param name New group name
     * @param groupId Group ID
     *
     * @throws ZaloApiError
     */
    return async function changeGroupName(name, groupId) {
        if (name.length == 0)
            name = Date.now().toString();
        const params = {
            grid: groupId,
            gname: name,
            imei: ctx.imei,
        };
        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams)
            throw new ZaloApiError.ZaloApiError("Failed to encrypt params");
        const response = await utils.request(serviceURL, {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });
        return utils.resolve(response);
    };
});

exports.changeGroupNameFactory = changeGroupNameFactory;
