import { AvatarSize, type UserBasic } from "../models/index.js";
export type FindUserByUsernameResponse = UserBasic;
export declare const findUserByUsernameFactory: (ctx: import("../context.js").ContextBase, api: import("../apis.js").API) => (username: string, avatarSize?: AvatarSize) => Promise<UserBasic>;
