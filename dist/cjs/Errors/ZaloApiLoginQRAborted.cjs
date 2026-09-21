'use strict';

var ZaloApiError = require('./ZaloApiError.cjs');

class ZaloApiLoginQRAborted extends ZaloApiError.ZaloApiError {
    constructor(message = "Operation aborted") {
        super(message);
        this.name = "ZaloApiLoginQRAborted";
    }
}

exports.ZaloApiLoginQRAborted = ZaloApiLoginQRAborted;
