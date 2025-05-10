export declare enum GroupEventType {
    JOIN_REQUEST = 0,
    JOIN = 1,
    LEAVE = 2,
    REMOVE_MEMBER = 3,
    BLOCK_MEMBER = 4,
    UPDATE_SETTING = 5,
    UPDATE = 6,
    NEW_LINK = 7,
    ADD_ADMIN = 8,
    REMOVE_ADMIN = 9,
    NEW_PIN_TOPIC = 10,
    UPDATE_PIN_TOPIC = 11,
    REORDER_PIN_TOPIC = 12,
    UPDATE_BOARD = 13,
    REMOVE_BOARD = 14,
    UPDATE_TOPIC = 15,
    UNPIN_TOPIC = 16,
    REMOVE_TOPIC = 17,
    ACCEPT_REMIND = 18,
    REJECT_REMIND = 19,
    REMIND_TOPIC = 20,
    UNKNOWN = 21
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
export type GroupTopic = {
    type: number;
    color: number;
    emoji: string;
    startTime: number;
    duration: number;
    params: string;
    id: string;
    creatorId: string;
    createTime: number;
    editorId: string;
    editTime: number;
    repeat: number;
    action: number;
};
export type GroupInfo = {
    group_link?: string;
    link_expired_time?: number;
    [key: string]: any;
};
export type GroupExtraData = {
    featureId?: number;
    field?: string;
    [key: string]: any;
};
export type TGroupEventBase = {
    subType: number;
    groupId: string;
    creatorId: string;
    groupName: string;
    sourceId: string;
    updateMembers: Member[];
    groupSetting: GroupSetting;
    groupTopic: GroupTopic | null;
    info: GroupInfo;
    extraData: GroupExtraData;
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
    groupTopic: GroupTopic;
    groupId: string;
    creatorId: string;
    subType?: number;
    updateMembers?: Member[];
    groupSetting?: GroupSetting;
    info?: GroupInfo;
    extraData?: GroupExtraData;
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
export type TGroupEvent = TGroupEventBase | TGroupEventJoinRequest | TGroupEventPinTopic | TGroupEventReorderPinTopic | TGroupEventBoard | TGroupEventRemindRespond | TGroupEventRemindTopic;
export type GroupEvent = {
    type: GroupEventType.JOIN_REQUEST;
    data: TGroupEventJoinRequest;
    threadId: string;
    isSelf: boolean;
} | {
    type: GroupEventType.NEW_PIN_TOPIC | GroupEventType.UNPIN_TOPIC | GroupEventType.UPDATE_PIN_TOPIC;
    data: TGroupEventPinTopic;
    threadId: string;
    isSelf: boolean;
} | {
    type: GroupEventType.REORDER_PIN_TOPIC;
    data: TGroupEventReorderPinTopic;
    threadId: string;
    isSelf: boolean;
} | {
    type: GroupEventType.UPDATE_BOARD | GroupEventType.REMOVE_BOARD;
    data: TGroupEventBoard;
    threadId: string;
    isSelf: boolean;
} | {
    type: GroupEventType.ACCEPT_REMIND | GroupEventType.REJECT_REMIND;
    data: TGroupEventRemindRespond;
    threadId: string;
    isSelf: boolean;
} | {
    type: GroupEventType.REMIND_TOPIC;
    data: TGroupEventRemindTopic;
    threadId: string;
    isSelf: boolean;
} | {
    type: Exclude<GroupEventType, GroupEventType.JOIN_REQUEST | GroupEventType.NEW_PIN_TOPIC | GroupEventType.UNPIN_TOPIC | GroupEventType.UPDATE_PIN_TOPIC | GroupEventType.REORDER_PIN_TOPIC | GroupEventType.UPDATE_BOARD | GroupEventType.REMOVE_BOARD | GroupEventType.ACCEPT_REMIND | GroupEventType.REJECT_REMIND | GroupEventType.REMIND_TOPIC>;
    data: TGroupEventBase;
    threadId: string;
    isSelf: boolean;
};
export declare function initializeGroupEvent(uid: string, data: TGroupEvent, type: GroupEventType): GroupEvent;
