import { ThreadType } from "../models/index.js";
export type DeleteChatResponse = {
    status: number;
};
export type ConverInfo = {
    ownerId: string;
    globalMsgId: string;
};
export declare const deleteChatFactory: (ctx: import("../context.js").ContextBase, api: import("../zalo.js").API) => (converInfo: ConverInfo, threadId: string, type?: ThreadType) => Promise<DeleteChatResponse>;
