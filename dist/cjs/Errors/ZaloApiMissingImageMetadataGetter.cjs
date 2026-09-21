'use strict';

var ZaloApiError = require('./ZaloApiError.cjs');

class ZaloApiMissingImageMetadataGetter extends ZaloApiError.ZaloApiError {
    constructor() {
        super("Missing `imageMetadataGetter`. Please provide it in the Zalo object options.");
        this.name = "ZaloApiMissingImageMetadataGetter";
    }
}

exports.ZaloApiMissingImageMetadataGetter = ZaloApiMissingImageMetadataGetter;
