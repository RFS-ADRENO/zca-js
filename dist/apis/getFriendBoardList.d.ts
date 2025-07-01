export type GetFriendBoardListResponse = {
    data: string[];
    version: number;
};
export declare const getFriendBoardListFactory: (ctx: import("../context.js").ContextBase, api: import("../zalo.js").API) => (conversationId: string) => Promise<GetFriendBoardListResponse>;
