export type RemoveUserFromGroupResponse = {
    errorMembers: string[];
};
export declare const removeUserFromGroupFactory: (ctx: import("../context.js").ContextBase, api: import("../zalo.js").API) => (memberId: string | string[], groupId: string) => Promise<RemoveUserFromGroupResponse>;
