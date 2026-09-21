import { DestType, ThreadType } from "../models/index.js";
export type SendTypingEventResponse = {
    status: number;
};
export declare const sendTypingEventFactory: (ctx: import("../context.js").ContextBase, api: import("../apis.js").API) => (threadId: string, type?: ThreadType, destType?: DestType) => Promise<SendTypingEventResponse>;
