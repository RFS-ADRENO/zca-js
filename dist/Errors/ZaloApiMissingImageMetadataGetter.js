import { ZaloApiError } from "./ZaloApiError.js";
export class ZaloApiMissingImageMetadataGetter extends ZaloApiError {
    constructor() {
        super("Missing `imageMetadataGetter`. Please provide it in the Zalo object options.");
        this.name = "ZaloApiMissingImageMetadataGetter";
    }
}
