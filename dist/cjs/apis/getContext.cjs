'use strict';

var utils = require('../utils.cjs');

const getContextFactory = utils.apiFactory()((_, ctx) => {
    return () => ctx;
});

exports.getContextFactory = getContextFactory;
