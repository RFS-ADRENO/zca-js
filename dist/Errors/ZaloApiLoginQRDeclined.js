import { ZaloApiError } from "./ZaloApiError.js";
export class ZaloApiLoginQRDeclined extends ZaloApiError {
    constructor(message = "Login QR request declined") {
        super(message);
        this.name = "ZaloApiLoginQRDeclined";
    }
}
