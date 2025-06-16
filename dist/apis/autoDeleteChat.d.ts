import { ThreadType } from "../models/index.js";
export declare enum MessageTTL {
    NO_DELETE = 0,
    ONE_DAY = 86400000,
    SEVEN_DAYS = 604800000,
    FOURTEEN_DAYS = 1209600000,
    THREE_DAYS = 259200000,
    FIVE_DAYS = 432000000
}
export type AutoDeleteChatResponse = "";
export declare const autoDeleteChatFactory: (ctx: import("../context.js").ContextBase, api: import("../zalo.js").API) => (ttl: (MessageTTL | number) | undefined, threadId: string, type?: ThreadType) => Promise<"">;
