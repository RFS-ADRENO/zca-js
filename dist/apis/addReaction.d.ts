import { ThreadType } from "../models/index.js";
import { Reactions } from "../models/Reaction.js";
export type AddReactionResponse = {
    msgIds: string;
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
export declare const addReactionFactory: (ctx: import("../context.js").ContextBase, api: import("../zalo.js").API) => (icon: Reactions | CustomReaction, dest: AddReactionDestination) => Promise<AddReactionResponse>;
