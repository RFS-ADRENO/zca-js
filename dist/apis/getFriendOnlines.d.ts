export type GetFriendOnlinesStatus = {
    userId: string;
    status: string;
};
export type GetFriendOnlinesResponse = {
    predefine: string[];
    ownerStatus: string;
    onlines: GetFriendOnlinesStatus[];
};
export declare const getFriendOnlinesFactory: (ctx: import("../context.js").ContextBase, api: import("../apis.js").API) => () => Promise<GetFriendOnlinesResponse>;
