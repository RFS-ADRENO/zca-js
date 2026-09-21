import { ThreadType } from "../models/index.js";
export type SendLinkOptions = {
    msg?: string;
    link: string;
    ttl?: number;
};
export type SendLinkResponse = {
    msgId: string;
};
export declare const sendLinkFactory: (ctx: import("../context.js").ContextBase, api: import("../apis.js").API) => (options: SendLinkOptions, threadId: string, type?: ThreadType) => Promise<SendLinkResponse>;
