export type CreateGroupResponse = {
    groupType: number;
    sucessMembers: string[];
    groupId: string;
    errorMembers: string[];
    error_data: Record<string, any>;
};
export declare const createGroupFactory: (ctx: import("../context.js").ContextBase, api: import("../zalo.js").API) => (options: {
    name?: string;
    members: string[];
    avatarPath?: string;
}) => Promise<CreateGroupResponse>;
