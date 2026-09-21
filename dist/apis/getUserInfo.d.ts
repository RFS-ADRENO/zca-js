import { AvatarSize, type UnchangedProfileInfo, type User } from "../models/index.js";
export type ProfileInfo = User;
export type UserInfoResponse = {
    unchanged_profiles: Record<string, Partial<UnchangedProfileInfo>>;
    phonebook_version: number;
    changed_profiles: Record<string, ProfileInfo>;
};
export declare const getUserInfoFactory: (ctx: import("../context.js").ContextBase, api: import("../apis.js").API) => (userId: string | string[], avatarSize?: AvatarSize) => Promise<UserInfoResponse>;
