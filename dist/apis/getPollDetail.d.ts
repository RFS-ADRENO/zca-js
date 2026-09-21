import type { PollDetail } from "../models/index.js";
export type PollDetailResponse = PollDetail;
export declare const getPollDetailFactory: (ctx: import("../context.js").ContextBase, api: import("../apis.js").API) => (pollId: number) => Promise<PollDetail>;
