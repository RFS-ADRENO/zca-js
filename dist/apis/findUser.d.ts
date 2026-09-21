import { AvatarSize, type UserBasic } from "../models/index.js";
export type FindUserResponse = UserBasic;
export declare const findUserFactory: (ctx: import("../context.js").ContextBase, api: import("../apis.js").API) => (phoneNumber: string, avatarSize?: AvatarSize) => Promise<UserBasic>;
