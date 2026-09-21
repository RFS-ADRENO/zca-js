import type { User } from "../models/index.js";
export type GetCloseFriendsResponse = User[];
export declare const getCloseFriendsFactory: (ctx: import("../context.js").ContextBase, api: import("../apis.js").API) => () => Promise<GetCloseFriendsResponse>;
