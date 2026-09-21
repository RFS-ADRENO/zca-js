import { ThreadType } from "../models/index.js";
export type RemoveUnreadMarkResponse = {
    data: {
        updateId: number;
    };
    status: number;
};
export declare const removeUnreadMarkFactory: (ctx: import("../context.js").ContextBase, api: import("../apis.js").API) => (threadId: string, type?: ThreadType) => Promise<RemoveUnreadMarkResponse>;
