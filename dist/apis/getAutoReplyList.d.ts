import type { AutoReplyItem } from "../models/index.js";
export type GetAutoReplyListResponse = {
    item: AutoReplyItem[];
    version: number;
};
export declare const getAutoReplyListFactory: (ctx: import("../context.js").ContextBase, api: import("../apis.js").API) => () => Promise<GetAutoReplyListResponse>;
