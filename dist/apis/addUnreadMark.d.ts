import { ThreadType } from "../models/index.js";
export type Data = {
    updateId: number;
};
export type AddUnreadMarkResponse = {
    data: Data;
    status: number;
};
export declare const addUnreadMarkFactory: (ctx: import("../context.js").ContextBase, api: import("../zalo.js").API) => (threadId: string, type?: ThreadType) => Promise<AddUnreadMarkResponse>;
