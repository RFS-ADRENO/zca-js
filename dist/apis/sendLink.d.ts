import { ThreadType } from "../models/Enum.js";
export type SendLinkParams = {
    link: string;
    ttl?: number;
};
export type SendLinkResponse = {
    msgId: string;
};
export declare const sendLinkFactory: (ctx: import("../context.js").ContextBase, api: import("../zalo.js").API) => (params: SendLinkParams, threadId: string, type?: ThreadType) => Promise<SendLinkResponse>;
