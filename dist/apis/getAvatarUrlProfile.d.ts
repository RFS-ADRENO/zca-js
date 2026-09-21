import { AvatarSize } from "../models/index.js";
export type GetAvatarUrlProfileResponse = {
    [userId: string]: {
        avatar: string;
    };
};
export declare const getAvatarUrlProfileFactory: (ctx: import("../context.js").ContextBase, api: import("../apis.js").API) => (friendIds: string | string[], avatarSize?: AvatarSize) => Promise<GetAvatarUrlProfileResponse>;
