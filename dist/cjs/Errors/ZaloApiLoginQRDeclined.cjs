'use strict';

var ZaloApiError = require('./ZaloApiError.cjs');

class ZaloApiLoginQRDeclined extends ZaloApiError.ZaloApiError {
    constructor(message = "Login QR request declined") {
        super(message);
        this.name = "ZaloApiLoginQRDeclined";
    }
}

exports.ZaloApiLoginQRDeclined = ZaloApiLoginQRDeclined;
