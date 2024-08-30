import { appContext } from "../context.js";

export enum GroupEventType {
    JOIN_REQUEST,
    JOIN_REJECT,
    JOIN,
    LEAVE,
    REMOVE_MEMBER,
    BLOCK_MEMBER,

    UPDATE_SETTING,
    UPDATE,
    NEW_LINK,

    ADD_ADMIN,
    REMOVE_ADMIN,

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

type TGroupEventBase = {
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

type TGroupEventJoinRequest = {
    uids: string[];
    totalPending: number;
    groupId: string;
    time: string;
};

type TGroupEventDeclineRequest = {
    totalPending: number;
    groupId: string;
    userIds: string[];
    reviewer: string;
    time: string;
};

type TGroupEvent = TGroupEventBase | TGroupEventJoinRequest | TGroupEventDeclineRequest;

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
            // (data.updateMembers && data.updateMembers.some((member) => member.id == appContext.uid!)) ||
            // data.sourceId == appContext.uid ||
            // data.reviewer == appContext.uid;
            isGroupEventJoinRequest(data)
                ? false
                : isGroupEventDeclineRequest(data)
                  ? data.reviewer == appContext.uid || data.userIds.includes(appContext.uid!)
                  : data.updateMembers.some((member) => member.id == appContext.uid!) ||
                    data.sourceId == appContext.uid;
    }
}

function isGroupEventJoinRequest(data: TGroupEvent): data is TGroupEventJoinRequest {
    return (
        (data as TGroupEventJoinRequest).hasOwnProperty("uids") &&
        (data as TGroupEventJoinRequest).hasOwnProperty("totalPending")
    );
}

function isGroupEventDeclineRequest(data: TGroupEvent): data is TGroupEventDeclineRequest {
    return (
        (data as TGroupEventDeclineRequest).hasOwnProperty("userIds") &&
        (data as TGroupEventDeclineRequest).hasOwnProperty("reviewer")
    );
}
