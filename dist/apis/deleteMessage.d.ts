import { ThreadType } from "../models/index.js";
export type DeleteMessageResponse = {
    status: number;
};
export type DeleteMessageOptions = {
    cliMsgId: string;
    msgId: string;
    uidFrom: string;
    onlyMe?: boolean;
};
export declare const deleteMessageFactory: (ctx: import("../context.js").ContextBase, api: import("../zalo.js").API) => (options: DeleteMessageOptions, threadId: string, type?: ThreadType) => Promise<DeleteMessageResponse>;
