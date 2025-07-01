export type UndoFriendRequestOptions = {
    fid: string;
};
export type UndoFriendRequestResponse = "";
export declare const undoFriendRequestFactory: (ctx: import("../context.js").ContextBase, api: import("../zalo.js").API) => (options: UndoFriendRequestOptions) => Promise<"">;
