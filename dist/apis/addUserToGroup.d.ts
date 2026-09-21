export type AddUserToGroupResponse = {
    errorMembers: string[];
    error_data: Record<string, string[]>;
};
export declare const addUserToGroupFactory: (ctx: import("../context.js").ContextBase, api: import("../apis.js").API) => (memberId: string | string[], groupId: string) => Promise<AddUserToGroupResponse>;
