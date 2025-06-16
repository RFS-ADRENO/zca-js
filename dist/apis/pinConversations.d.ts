import { ThreadType } from "../models/index.js";
export type PinConversationsResponse = "";
export declare const pinConversationsFactory: (ctx: import("../context.js").ContextBase, api: import("../zalo.js").API) => (pin: boolean, threadId: string | string[], type?: ThreadType) => Promise<"">;
