export class ZaloApiError extends Error {
    constructor(message, code) {
        super(message);
        this.name = "ZcaApiError";
        this.code = code || null;
    }
}
