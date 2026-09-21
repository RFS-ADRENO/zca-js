import { ThreadType } from "../models/index.js";
export type UndoPayload = {
    msgId: string | number;
    cliMsgId: string | number;
};
export type UndoResponse = {
    status: number;
};
export declare const undoFactory: (ctx: import("../context.js").ContextBase, api: import("../apis.js").API) => (payload: UndoPayload, threadId: string, type?: ThreadType) => Promise<UndoResponse>;
