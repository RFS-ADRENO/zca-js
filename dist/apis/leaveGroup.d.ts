export type LeaveGroupResponse = {
    memberError: string[];
};
export declare const leaveGroupFactory: (ctx: import("../context.js").ContextBase, api: import("../zalo.js").API) => (groupId: string | string[], silent?: boolean) => Promise<LeaveGroupResponse>;
