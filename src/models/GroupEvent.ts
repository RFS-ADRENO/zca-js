import { appContext } from "../context.js";

export enum GroupEventType {
    JOIN,
    LEAVE,
    REMOVE_MEMBER,
    BLOCK_MEMBER,

    UPDATE_SETTING,
    UPDATE,
    NEW_LINK,

    UNKNOWN,
}

export type Member = {
    id: string;
    dName: string;
    avatar: string;
    type: number;
    avatar_25: string;
};

export type GroupSetting = {
    blockName: number;
    signAdminMsg: number;
    addMemberOnly: number;
    setTopicOnly: number;
    enableMsgHistory: number;
    joinAppr: number;
    lockCreatePost: number;
    lockCreatePoll: number;
    lockSendMsg: number;
    lockViewMember: number;
    bannFeature: number;
    dirtyMedia: number;
    banDuration: number;
};

type TGroupEvent = {
    subType: number;
    groupId: string;
    creatorId: string;
    groupName: string;
    sourceId: string;
    updateMembers: Member[];
    groupSetting: GroupSetting;
    groupTopic: null;
    info: {
        group_link?: string;
        link_expired_time?: number;
        [key: string]: any;
    };
    extraData: {
        featureId?: number;
        [key: string]: any;
    };
    time: string;
    avt: null;
    fullAvt: null;
    isAdd: number;
    hideGroupInfo: number;
    version: string;
    groupType: number;
    clientId: number;
    errorMap: Record<string, any>;
    e2ee: number;
};

export class GroupEvent {
    type: GroupEventType;
    data: TGroupEvent;
    threadId: string;
    isSelf: boolean;

    constructor(data: TGroupEvent, type: GroupEventType) {
        this.type = type;
        this.data = data;
        this.threadId = data.groupId;
        this.isSelf =
            data.updateMembers.some((member) => member.id == appContext.uid!) || data.sourceId == appContext.uid;
    }
}
