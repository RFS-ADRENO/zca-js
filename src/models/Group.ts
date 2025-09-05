import type { GroupSetting } from "./GroupEvent.js";

export type DetailGroupInfo = {
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
    topic?: {
        type: number;
        color: number;
        emoji: string;
        startTime: number;
        duration: number;
        params: {
            senderUid: string;
            senderName: string;
            client_msg_id: string;
            thumb: string;
            global_msg_id: string;
            msg_type: number;
            title: string;
        };
        id: string;
        creatorId: string;
        editorId: string;
        createTime: number;
        editTime: number;
        repeat: number;
    };
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
