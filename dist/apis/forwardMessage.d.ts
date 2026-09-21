import { ThreadType } from "../models/index.js";
export type ForwardMessagePayload = {
    message: string;
    ttl?: number;
    reference?: {
        id: string;
        ts: number;
        logSrcType: number;
        fwLvl: number;
    };
};
export type ForwardMessageSuccess = {
    clientId: string;
    msgId: string;
};
export type ForwardMessageFail = {
    clientId: string;
    error_code: string;
};
export type ForwardMessageResponse = {
    success: ForwardMessageSuccess[];
    fail: ForwardMessageFail[];
};
export declare const forwardMessageFactory: (ctx: import("../context.js").ContextBase, api: import("../apis.js").API) => (payload: ForwardMessagePayload, threadIds: string[], type?: ThreadType) => Promise<ForwardMessageResponse>;
