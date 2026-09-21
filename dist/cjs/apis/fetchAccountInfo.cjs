'use strict';

var utils = require('../utils.cjs');

const fetchAccountInfoFactory = utils.apiFactory()((api, _, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.profile[0]}/api/social/profile/me-v2`);
    return async function fetchAccountInfo() {
        const response = await utils.request(serviceURL, {
            method: "GET",
        });
        return utils.resolve(response);
    };
});

exports.fetchAccountInfoFactory = fetchAccountInfoFactory;
