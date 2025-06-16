export type AddUserToGroupResponse = {
    errorMemebers: string[];
    error_data: Record<string, any>;
};
export declare const addUserToGroupFactory: (ctx: import("../context.js").ContextBase, api: import("../zalo.js").API) => (memberId: string | string[], groupId: string) => Promise<AddUserToGroupResponse>;
