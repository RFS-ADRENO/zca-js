import { ThreadType } from "../models/index.js";
export type UpdateAutoDeleteChatResponse = "";
export declare const updateAutoDeleteChatFactory: (ctx: import("../context.js").ContextBase, api: import("../zalo.js").API) => (ttl: number | undefined, threadId: string, isGroup?: ThreadType) => Promise<"">;
