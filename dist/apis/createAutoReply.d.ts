import type { AutoReplyItem, AutoReplyScope } from "../models/index.js";
export type CreateAutoReplyPayload = {
    content: string;
    isEnable: boolean;
    startTime: number;
    endTime: number;
    scope: AutoReplyScope;
    uids?: string | string[];
};
export type CreateAutoReplyResponse = {
    item: AutoReplyItem;
    version: number;
};
export declare const createAutoReplyFactory: (ctx: import("../context.js").ContextBase, api: import("../apis.js").API) => (payload: CreateAutoReplyPayload) => Promise<CreateAutoReplyResponse>;
