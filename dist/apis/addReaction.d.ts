import { ThreadType } from "../models/Enum.js";
import type { Message } from "../models/Message.js";
import { Reactions } from "../models/Reaction.js";
export type AddReactionResponse = {
    msgIds: string;
};
export type CustomReaction = {
    rType: number;
    source: number;
    icon: string;
};
export declare const addReactionFactory: (ctx: import("../context.js").ContextBase, api: import("../zalo.js").API) => (icon: Reactions | CustomReaction, message: Message, type?: ThreadType) => Promise<AddReactionResponse>;
