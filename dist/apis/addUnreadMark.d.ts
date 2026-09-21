import { ThreadType } from "../models/index.js";
export type AddUnreadMarkResponse = {
    data: {
        updateId: number;
    };
    status: number;
};
export declare const addUnreadMarkFactory: (ctx: import("../context.js").ContextBase, api: import("../apis.js").API) => (threadId: string, type?: ThreadType) => Promise<AddUnreadMarkResponse>;
