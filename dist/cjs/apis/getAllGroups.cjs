'use strict';

var utils = require('../utils.cjs');

const getAllGroupsFactory = utils.apiFactory()((api, _, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.group_poll[0]}/api/group/getlg/v4`);
    return async function getAllGroups() {
        const response = await utils.request(serviceURL, {
            method: "GET",
        });
        return utils.resolve(response);
    };
});

exports.getAllGroupsFactory = getAllGroupsFactory;
