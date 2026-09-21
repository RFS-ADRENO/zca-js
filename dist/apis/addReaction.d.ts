import { ThreadType, Reactions } from "../models/index.js";
export type AddReactionResponse = {
    msgIds: number[];
};
export type CustomReaction = {
    rType: number;
    source: number;
    icon: string;
};
export type AddReactionDestination = {
    data: {
        msgId: string;
        cliMsgId: string;
    };
    threadId: string;
    type: ThreadType;
};
export declare const addReactionFactory: (ctx: import("../context.js").ContextBase, api: import("../apis.js").API) => (icon: Reactions | CustomReaction, dest: AddReactionDestination) => Promise<AddReactionResponse>;
