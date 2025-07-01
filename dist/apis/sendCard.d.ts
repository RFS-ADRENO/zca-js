import { ThreadType } from "../models/index.js";
export type SendCardOptions = {
    userId: string;
    phoneNumber?: string;
    ttl?: number;
};
export type SendCardResponse = {
    msgId: number;
};
export declare const sendCardFactory: (ctx: import("../context.js").ContextBase, api: import("../zalo.js").API) => (options: SendCardOptions, threadId: string, type?: ThreadType) => Promise<SendCardResponse>;
