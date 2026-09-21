import { ThreadType } from "../models/index.js";
export type SetHiddenConversationsResponse = "";
export declare const setHiddenConversationsFactory: (ctx: import("../context.js").ContextBase, api: import("../apis.js").API) => (hidden: boolean, threadId: string | string[], type?: ThreadType) => Promise<"">;
