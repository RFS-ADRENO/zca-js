import { AvatarSize, type User } from "../models/index.js";
export type GetAllFriendsResponse = User[];
export declare const getAllFriendsFactory: (ctx: import("../context.js").ContextBase, api: import("../apis.js").API) => (count?: number, page?: number, avatarSize?: AvatarSize) => Promise<GetAllFriendsResponse>;
