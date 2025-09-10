import type { GroupSetting, GroupTopic } from "./Group.js";
import type { ReminderGroup } from "./Reminder.js";

export enum GroupEventType {
    JOIN_REQUEST = "join_request",
    JOIN = "join",
    LEAVE = "leave",
    REMOVE_MEMBER = "remove_member",
    BLOCK_MEMBER = "block_member",

    UPDATE_SETTING = "update_setting",
    UPDATE = "update",
    NEW_LINK = "new_link",

    ADD_ADMIN = "add_admin",
    REMOVE_ADMIN = "remove_admin",

    NEW_PIN_TOPIC = "new_pin_topic",
    UPDATE_PIN_TOPIC = "update_pin_topic",
    REORDER_PIN_TOPIC = "reorder_pin_topic",

    UPDATE_BOARD = "update_board",
    REMOVE_BOARD = "remove_board",

    UPDATE_TOPIC = "update_topic",
    UNPIN_TOPIC = "unpin_topic",
    REMOVE_TOPIC = "remove_topic",

    ACCEPT_REMIND = "accept_remind",
    REJECT_REMIND = "reject_remind",
    REMIND_TOPIC = "remind_topic",

    UPDATE_AVATAR = "update_avatar",

    UNKNOWN = "unknown",
}

export type GroupEventUpdateMember = {
    id: string;
    dName: string;
    avatar: string;
    type: number;
    avatar_25: string;
};

export type GroupEventGroupInfo = {
    group_link?: string;
    link_expired_time?: number;
    [key: string]: unknown;
};

export type GroupEventExtraData = {
    featureId?: number;
    field?: string;
    [key: string]: unknown;
};

export type TGroupEventBase = {
    subType: number;
    groupId: string;
    creatorId: string;
    groupName: string;
    sourceId: string;
    updateMembers: GroupEventUpdateMember[];
    groupSetting: GroupSetting | null;
    groupTopic: GroupTopic | null;
    info: GroupEventGroupInfo | null;
    extraData: GroupEventExtraData | null;
    time: string;
    avt: string | null;
    fullAvt: string | null;
    isAdd: number;
    hideGroupInfo: number;
    version: string;
    groupType: number;
    clientId?: number;
    errorMap?: Record<string, unknown>;
    e2ee?: number;
};

export type TGroupEventJoinRequest = {
    uids: string[];
    totalPending: number;
    groupId: string;
    time: string;
};

export type TGroupEventPinTopic = {
    oldBoardVersion: number;
    boardVersion: number;
    topic: GroupTopic;
    actorId: string;
    groupId: string;
};

export type TGroupEventReorderPinTopic = {
    oldBoardVersion: number;
    actorId: string;
    topics: {
        topicId: string;
        topicType: number;
    }[];
    groupId: string;
    boardVersion: number;
    topic: null;
};

export type TGroupEventBoard = {
    sourceId: string;
    groupName: string;
    groupTopic: (GroupTopic | ReminderGroup) & { params: string };
    groupId: string;
    creatorId: string;

    subType?: number;
    updateMembers?: GroupEventUpdateMember[];
    groupSetting?: GroupSetting;
    info?: GroupEventGroupInfo;
    extraData?: GroupEventExtraData;
    time?: string;
    avt?: null;
    fullAvt?: null;
    isAdd?: number;
    hideGroupInfo?: number;
    version?: string;
    groupType?: number;
};

export type TGroupEventRemindRespond = {
    topicId: string;
    updateMembers: string[];
    groupId: string;
    time: string;
};

export type TGroupEventRemindTopic = {
    msg: string;
    editorId: string;
    color: string;
    emoji: string;
    creatorId: string;
    editTime: number;
    type: number;
    duration: number;
    group_id: string;
    createTime: number;
    repeat: number;
    startTime: number;
    time: number;
    remindType: number;
};

export type TGroupEvent =
    | TGroupEventBase
    | TGroupEventJoinRequest
    | TGroupEventPinTopic
    | TGroupEventReorderPinTopic
    | TGroupEventBoard
    | TGroupEventRemindRespond
    | TGroupEventRemindTopic;

export type GroupEvent =
    | {
          type: GroupEventType.JOIN_REQUEST;
          data: TGroupEventJoinRequest;
          act: string;
          threadId: string;
          isSelf: boolean;
      }
    | {
          type: GroupEventType.NEW_PIN_TOPIC | GroupEventType.UNPIN_TOPIC | GroupEventType.UPDATE_PIN_TOPIC;
          data: TGroupEventPinTopic;
          act: string;
          threadId: string;
          isSelf: boolean;
      }
    | {
          type: GroupEventType.REORDER_PIN_TOPIC;
          data: TGroupEventReorderPinTopic;
          act: string;
          threadId: string;
          isSelf: boolean;
      }
    | {
          type: GroupEventType.UPDATE_BOARD | GroupEventType.REMOVE_BOARD;
          data: TGroupEventBoard;
          act: string;
          threadId: string;
          isSelf: boolean;
      }
    | {
          type: GroupEventType.ACCEPT_REMIND | GroupEventType.REJECT_REMIND;
          data: TGroupEventRemindRespond;
          act: string;
          threadId: string;
          isSelf: boolean;
      }
    | {
          type: GroupEventType.REMIND_TOPIC;
          data: TGroupEventRemindTopic;
          act: string;
          threadId: string;
          isSelf: boolean;
      }
    | {
          type: Exclude<
              GroupEventType,
              | GroupEventType.JOIN_REQUEST
              | GroupEventType.NEW_PIN_TOPIC
              | GroupEventType.UNPIN_TOPIC
              | GroupEventType.UPDATE_PIN_TOPIC
              | GroupEventType.REORDER_PIN_TOPIC
              | GroupEventType.UPDATE_BOARD
              | GroupEventType.REMOVE_BOARD
              | GroupEventType.ACCEPT_REMIND
              | GroupEventType.REJECT_REMIND
              | GroupEventType.REMIND_TOPIC
          >;
          data: TGroupEventBase;
          act: string;
          threadId: string;
          isSelf: boolean;
      };

export function initializeGroupEvent(uid: string, data: TGroupEvent, type: GroupEventType, act: string): GroupEvent {
    const threadId = "group_id" in data ? data.group_id : data.groupId;

    if (type == GroupEventType.JOIN_REQUEST) {
        return { type, act, data: data as TGroupEventJoinRequest, threadId, isSelf: false };
    } else if (
        type == GroupEventType.NEW_PIN_TOPIC ||
        type == GroupEventType.UNPIN_TOPIC ||
        type == GroupEventType.UPDATE_PIN_TOPIC
    ) {
        return {
            type,
            act,
            data: data as TGroupEventPinTopic,
            threadId,
            isSelf: (data as TGroupEventPinTopic).actorId == uid,
        };
    } else if (type == GroupEventType.REORDER_PIN_TOPIC) {
        return {
            type,
            act,
            data: data as TGroupEventReorderPinTopic,
            threadId,
            isSelf: (data as TGroupEventPinTopic).actorId == uid,
        };
    } else if (type == GroupEventType.UPDATE_BOARD || type == GroupEventType.REMOVE_BOARD) {
        return {
            type,
            act,
            data: data as TGroupEventBoard,
            threadId,
            isSelf: (data as TGroupEventBoard).sourceId == uid,
        };
    } else if (type == GroupEventType.ACCEPT_REMIND || type == GroupEventType.REJECT_REMIND) {
        return {
            type,
            act,
            data: data as TGroupEventRemindRespond,
            threadId,
            isSelf: (data as TGroupEventRemindRespond).updateMembers.some((memberId) => memberId == uid),
        };
    } else if (type == GroupEventType.REMIND_TOPIC) {
        return {
            type,
            act,
            data: data as TGroupEventRemindTopic,
            threadId,
            isSelf: (data as TGroupEventRemindTopic).creatorId == uid,
        };
    } else {
        const baseData = data as TGroupEventBase;

        return {
            type,
            act,
            data: baseData,
            threadId,
            isSelf: baseData.updateMembers?.some((member) => member.id == uid) || baseData.sourceId == uid,
        };
    }
}
