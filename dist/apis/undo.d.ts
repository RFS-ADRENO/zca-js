import { ThreadType } from "../models/index.js";
export type UndoOptions = {
    msgId: string | number;
    cliMsgId: string | number;
};
export type UndoResponse = {
    status: number;
};
export declare const undoFactory: (ctx: import("../context.js").ContextBase, api: import("../zalo.js").API) => (options: UndoOptions, threadId: string, type: ThreadType) => Promise<UndoResponse>;
