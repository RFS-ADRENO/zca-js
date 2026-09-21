export type DeleteGroupInviteBoxResponse = {
    delInvitaionIds: string[];
    errMap: {
        [groupId: string]: {
            err: number;
        };
    };
};
export declare const deleteGroupInviteBoxFactory: (ctx: import("../context.js").ContextBase, api: import("../apis.js").API) => (groupId: string | string[], blockFutureInvite?: boolean) => Promise<DeleteGroupInviteBoxResponse>;
