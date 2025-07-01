import { ThreadType } from "../models/index.js";
export type Success = {
    clientId: string;
    msgId: string;
};
export type Failed = {
    clientId: string;
    errorCode: number;
    errorMessage: string;
};
export type ForwardMessageResponse = {
    success: Success[];
    failed: Failed[];
};
export type ForwardMessageParams = {
    message: string;
    threadIds: string[];
    ttl?: number;
    reference?: {
        id: string;
        ts: number;
        logSrcType: number;
        fwLvl: number;
    };
};
export declare const forwardMessageFactory: (ctx: import("../context.js").ContextBase, api: import("../zalo.js").API) => (params: ForwardMessageParams, type?: ThreadType) => Promise<ForwardMessageResponse>;
