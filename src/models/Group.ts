import type { GroupSetting } from "./GroupEvent.js";

export type GroupInfo = {
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
    currentMems: {
        id: string;
        dName: string;
        zaloName: string;
        avatar: string;
        avatar_25: string;
        accountStatus: number;
        type: number;
    }[];
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
