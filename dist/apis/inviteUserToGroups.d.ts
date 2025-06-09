export type GridMessage = {
    error_code: number;
    error_message: string;
    data: string;
};
export type InviteUserToGroupsResponse = {
    grid_message_map: {
        [gridId: string]: GridMessage;
    };
};
export declare const inviteUserToGroupsFactory: (ctx: import("../context.js").ContextBase, api: import("../zalo.js").API) => (memberId: string, groupId: string | string[]) => Promise<InviteUserToGroupsResponse>;
