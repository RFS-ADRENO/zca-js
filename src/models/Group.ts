import type { GroupSetting } from "./GroupEvent.js";
import type { DetailUser } from "./User.js";

export type Group = {
    groupId: string;
    name: string;
    desc: string;
    type: number;
    creatorId: string;
    version: string;
    avt: string;
    fullAvt: string;
    memberIds: string[];
    adminIds: string[];
    currentMems: DetailUser[];
    updateMems: unknown[];
    memVerList?: string[];
    admins: unknown[];
    hasMoreMember: number;
    subType: number;
    totalMember: number;
    maxMember: number;
    setting: GroupSetting;
    createdTime: number;
    visibility: number;
    globalId: string;
    /**
     * 1: True, 0: False
     */
    e2ee: number;
    pendingApprove?: {
        time: number;
        uids: string[] | null;
    };
    extraInfo: {
        enable_media_store: number;
    };
};
