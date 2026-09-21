import type { QuickMessage } from "../models/index.js";
export type GetQuickMessageListResponse = {
    cursor: number;
    version: number;
    items: QuickMessage[];
};
export declare const getQuickMessageListFactory: (ctx: import("../context.js").ContextBase, api: import("../apis.js").API) => () => Promise<GetQuickMessageListResponse>;
