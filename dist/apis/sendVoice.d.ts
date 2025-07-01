import { ThreadType } from "../models/index.js";
export type SendVoiceOptions = {
    voiceUrl: string;
    /**
     * Time to live in miliseconds (default: 0)
     */
    ttl?: number;
};
export type SendVoiceResponse = {
    msgId: string;
};
export declare const sendVoiceFactory: (ctx: import("../context.js").ContextBase, api: import("../zalo.js").API) => (options: SendVoiceOptions, threadId: string, type?: ThreadType) => Promise<SendVoiceResponse>;
