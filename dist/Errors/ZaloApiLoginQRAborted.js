import { ZaloApiError } from "./ZaloApiError.js";
export class ZaloApiLoginQRAborted extends ZaloApiError {
    constructor(message = "Operation aborted") {
        super(message);
        this.name = "ZaloApiLoginQRAborted";
    }
}
