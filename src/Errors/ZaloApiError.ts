export class ZaloApiError extends Error {
    public code: number | null;

    constructor(message: string, code?: number) {
        super(message);

        this.name = "ZcaApiError";
        this.code = code || null;
    }
}
