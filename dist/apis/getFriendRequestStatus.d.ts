export type GetFriendRequestStatusResponse = {
    addFriendPrivacy: number;
    isSeenFriendReq: boolean;
    is_friend: number;
    is_requested: number;
    is_requesting: number;
};
export declare const getFriendRequestStatusFactory: (ctx: import("../context.js").ContextBase, api: import("../apis.js").API) => (friendId: string) => Promise<GetFriendRequestStatusResponse>;
