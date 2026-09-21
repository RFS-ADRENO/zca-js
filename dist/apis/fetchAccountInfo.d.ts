import type { User } from "../models/index.js";
export type FetchAccountInfoResponse = {
    profile: User;
};
export declare const fetchAccountInfoFactory: (ctx: import("../context.js").ContextBase, api: import("../apis.js").API) => () => Promise<FetchAccountInfoResponse>;
