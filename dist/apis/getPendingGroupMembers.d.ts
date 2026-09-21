export type GetPendingGroupMembersUserInfo = {
    uid: string;
    dpn: string;
    avatar: string;
    user_submit: null;
};
export type GetPendingGroupMembersResponse = {
    time: number;
    users: GetPendingGroupMembersUserInfo[];
};
export declare const getPendingGroupMembersFactory: (ctx: import("../context.js").ContextBase, api: import("../apis.js").API) => (groupId: string) => Promise<GetPendingGroupMembersResponse>;
