import { ThreadType } from "../models/Enum.js";
export type Data = {
    updateId: number;
};
export type RemoveUnreadMarkResponse = {
    data: Data;
    status: number;
};
export declare const removeUnreadMarkFactory: (ctx: import("../context.js").ContextBase, api: import("../zalo.js").API) => (threadId: string, type?: ThreadType) => Promise<RemoveUnreadMarkResponse>;
