'use strict';

var utils = require('../utils.cjs');

const getCookieFactory = utils.apiFactory()((_, ctx) => {
    /**
     * Get the current cookie string
     */
    return function getCookie() {
        return ctx.cookie;
    };
});

exports.getCookieFactory = getCookieFactory;
