export declare class ZaloApiError extends Error {
    code: number | null;
    constructor(message: string, code?: number);
}
