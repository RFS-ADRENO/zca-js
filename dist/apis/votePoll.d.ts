import type { PollOptions } from "../models/index.js";
export type VotePollResponse = {
    options: PollOptions[];
};
export declare const votePollFactory: (ctx: import("../context.js").ContextBase, api: import("../apis.js").API) => (pollId: number, optionId: number | number[]) => Promise<VotePollResponse>;
