export type InviteUserToGroupsResponse = {
    grid_message_map: {
        [groupId: string]: {
            error_code: number;
            error_message: string;
            data: string | null;
        };
    };
};
export declare const inviteUserToGroupsFactory: (ctx: import("../context.js").ContextBase, api: import("../apis.js").API) => (userId: string, groupId: string | string[]) => Promise<InviteUserToGroupsResponse>;
