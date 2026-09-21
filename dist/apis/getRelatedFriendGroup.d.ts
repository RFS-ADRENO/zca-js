export type GetRelatedFriendGroupResponse = {
    groupRelateds: {
        [friendId: string]: string[];
    };
};
export declare const getRelatedFriendGroupFactory: (ctx: import("../context.js").ContextBase, api: import("../apis.js").API) => (friendId: string | string[]) => Promise<GetRelatedFriendGroupResponse>;
