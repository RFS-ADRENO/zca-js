export type RemoveFriendOptions = {
    fid: string;
};
export type RemoveFriendResponse = "";
export declare const removeFriendFactory: (ctx: import("../context.js").ContextBase, api: import("../zalo.js").API) => (options: RemoveFriendOptions) => Promise<"">;
