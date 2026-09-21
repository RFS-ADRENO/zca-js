'use strict';

var utils = require('../utils.cjs');

const getOwnIdFactory = utils.apiFactory()((_, ctx) => {
    return () => ctx.uid;
});

exports.getOwnIdFactory = getOwnIdFactory;
