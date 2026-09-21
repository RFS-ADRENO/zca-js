export type GetFullAvatarResponse = {
    bk_full_avatar: string;
    full_avatar: string;
};
export declare const getFullAvatarFactory: (ctx: import("../context.js").ContextBase, api: import("../apis.js").API) => (friendId: string) => Promise<GetFullAvatarResponse>;
