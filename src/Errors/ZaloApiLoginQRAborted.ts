import { ZaloApiError } from "./ZaloApiError.js";

export class ZaloApiLoginQRAborted extends ZaloApiError {
    constructor(message: string = "Operation aborted") {
        super(message);
        this.name = "ZaloApiLoginQRAborted";
    }
}
