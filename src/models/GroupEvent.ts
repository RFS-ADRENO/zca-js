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

export type TGroupEventBase = {
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

export type TGroupEventJoinRequest = {
    uids: string[];
    totalPending: number;
    groupId: string;
    time: string;
};

export type TGroupEventRejectRequest = {
    totalPending: number;
    groupId: string;
    userIds: string[];
    reviewer: string;
    time: string;
};

export type TGroupEvent = TGroupEventBase | TGroupEventJoinRequest | TGroupEventRejectRequest;

export type GroupEvent =
    | {
          type: GroupEventType.JOIN_REQUEST;
          data: TGroupEventJoinRequest;
          threadId: string;
          isSelf: boolean;
      }
    | {
          type: GroupEventType.JOIN_REJECT;
          data: TGroupEventRejectRequest;
          threadId: string;
          isSelf: boolean;
      }
    | {
          type: Exclude<GroupEventType, GroupEventType.JOIN_REQUEST | GroupEventType.JOIN_REJECT>;
          data: TGroupEventBase;
          threadId: string;
          isSelf: boolean;
      };

export function initializeGroupEvent(data: TGroupEvent, type: GroupEventType): GroupEvent {
    const threadId = data.groupId;
    if (type == GroupEventType.JOIN_REQUEST) {
        return { type, data: data as TGroupEventJoinRequest, threadId, isSelf: false };
    } else if (type == GroupEventType.JOIN_REJECT) {
        const rejectData = data as TGroupEventRejectRequest;
        return {
            type,
            data: rejectData,
            threadId,
            isSelf: rejectData.reviewer == appContext.uid || rejectData.userIds.includes(appContext.uid!),
        };
    } else {
        const baseData = data as TGroupEventBase;

        return {
            type,
            data: baseData,
            threadId,
            isSelf:
                baseData.updateMembers.some((member) => member.id == appContext.uid!) ||
                baseData.sourceId == appContext.uid,
        };
    }
}
