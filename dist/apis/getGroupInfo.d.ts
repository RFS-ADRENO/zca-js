import type { GroupInfo } from "../models/index.js";
export type GroupInfoResponse = {
    removedsGroup: string[];
    unchangedsGroup: string[];
    gridInfoMap: {
        [groupId: string]: GroupInfo & {
            memVerList: string[];
            pendingApprove: GroupInfoPendingApprove;
        };
    };
};
export type GroupInfoPendingApprove = {
    time: number;
    uids: string[] | null;
};
export declare const getGroupInfoFactory: (ctx: import("../context.js").ContextBase, api: import("../apis.js").API) => (groupId: string | string[]) => Promise<GroupInfoResponse>;
