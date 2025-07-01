import type { GroupSetting } from "../models/GroupEvent.js";
export type LinkGroupInfoResponse = {
    groupId: string;
    name: string;
    desc: string;
    type: number;
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
    admins: any[];
    hasMoreMember: number;
    subType: number;
    totalMember: number;
    setting: GroupSetting;
    globalId: string;
};
export declare const linkGroupInfoFactory: (ctx: import("../context.js").ContextBase, api: import("../zalo.js").API) => (link: string) => Promise<LinkGroupInfoResponse>;
