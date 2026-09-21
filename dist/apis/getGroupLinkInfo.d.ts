import type { GroupSetting, GroupType } from "../models/index.js";
export type GetGroupLinkInfoPayload = {
    link: string;
    /**
     * Default: 1
     */
    memberPage?: number;
};
export type GetGroupLinkInfoResponse = {
    groupId: string;
    name: string;
    desc: string;
    type: GroupType;
    creatorId: string;
    avt: string;
    fullAvt: string;
    adminIds: string[];
    currentMems: {
        id: string;
        dName: string;
        zaloName: string;
        avatar: string;
        avatar_25: string;
        accountStatus: number;
        type: number;
    }[];
    admins: unknown[];
    hasMoreMember: number;
    subType: number;
    totalMember: number;
    setting: GroupSetting;
    globalId: string;
};
export declare const getGroupLinkInfoFactory: (ctx: import("../context.js").ContextBase, api: import("../apis.js").API) => (payload: GetGroupLinkInfoPayload) => Promise<GetGroupLinkInfoResponse>;
