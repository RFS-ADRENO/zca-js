import { ThreadType } from "../models/index.js";
export declare enum ChatTTL {
    NO_DELETE = 0,
    ONE_DAY = 86400000,
    SEVEN_DAYS = 604800000,
    FOURTEEN_DAYS = 1209600000
}
export type UpdateAutoDeleteChatResponse = "";
export declare const updateAutoDeleteChatFactory: (ctx: import("../context.js").ContextBase, api: import("../apis.js").API) => (ttl: ChatTTL, threadId: string, type?: ThreadType) => Promise<"">;
