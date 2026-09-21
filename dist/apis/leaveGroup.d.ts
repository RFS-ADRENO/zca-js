export type LeaveGroupResponse = {
    memberError: unknown[];
};
export declare const leaveGroupFactory: (ctx: import("../context.js").ContextBase, api: import("../apis.js").API) => (groupId: string, silent?: boolean) => Promise<LeaveGroupResponse>;
