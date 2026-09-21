import { ThreadType } from "../models/index.js";
export type DeleteMessageResponse = {
    status: number;
};
export type DeleteMessageDestination = {
    data: {
        cliMsgId: string;
        msgId: string;
        uidFrom: string;
    };
    threadId: string;
    type?: ThreadType;
};
export declare const deleteMessageFactory: (ctx: import("../context.js").ContextBase, api: import("../apis.js").API) => (dest: DeleteMessageDestination, onlyMe?: boolean) => Promise<DeleteMessageResponse>;
