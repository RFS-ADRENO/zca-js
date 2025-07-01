export declare enum FriendEventType {
    ADD = 0,
    REMOVE = 1,
    REQUEST = 2,
    UNDO_REQUEST = 3,
    REJECT_REQUEST = 4,
    SEEN_FRIEND_REQUEST = 5,
    BLOCK = 6,
    UNBLOCK = 7,
    BLOCK_CALL = 8,
    UNBLOCK_CALL = 9,
    PIN_UNPIN = 10,
    PIN_CREATE = 11,
    UNKNOWN = 12
}
export type TFriendEventBase = string;
export type TFriendEventRejectUndo = {
    toUid: string;
    fromUid: string;
};
export type TFriendEventRequest = {
    toUid: string;
    fromUid: string;
    src: number;
    message: string;
};
export type TFriendEventSeenRequest = string[];
export type TFriendEventPinCreateTopicParams = {
    senderUid: string;
    senderName: string;
    client_msg_id: string;
    global_msg_id: string;
    msg_type: number;
    title: string;
};
export type TFriendEventPinTopic = {
    topicId: string;
    topicType: number;
};
export type TFriendEventPinCreateTopic = {
    type: number;
    color: number;
    emoji: string;
    startTime: number;
    duration: number;
    params: TFriendEventPinCreateTopicParams;
    id: string;
    creatorId: string;
    createTime: number;
    editorId: string;
    editTime: number;
    repeat: number;
    action: number;
};
export type TFriendEventPinCreate = {
    oldTopic?: TFriendEventPinTopic;
    topic: TFriendEventPinCreateTopic;
    actorId: string;
    oldVersion: number;
    version: number;
    conversationId: string;
};
export type TFriendEventPinUnpin = {
    topic: TFriendEventPinTopic;
    actorId: string;
    oldVersion: number;
    version: number;
    conversationId: string;
};
export type TFriendEvent = TFriendEventBase | TFriendEventRequest | TFriendEventRejectUndo | TFriendEventSeenRequest | TFriendEventPinUnpin | TFriendEventPinCreate;
export type FriendEvent = {
    type: FriendEventType.ADD | FriendEventType.REMOVE | FriendEventType.BLOCK | FriendEventType.UNBLOCK | FriendEventType.BLOCK_CALL | FriendEventType.UNBLOCK_CALL;
    data: TFriendEventBase;
    threadId: string;
    isSelf: boolean;
} | {
    type: FriendEventType.REJECT_REQUEST | FriendEventType.UNDO_REQUEST;
    data: TFriendEventRejectUndo;
    threadId: string;
    isSelf: boolean;
} | {
    type: FriendEventType.REQUEST;
    data: TFriendEventRequest;
    threadId: string;
    isSelf: boolean;
} | {
    type: FriendEventType.SEEN_FRIEND_REQUEST;
    data: TFriendEventSeenRequest;
    threadId: string;
    isSelf: boolean;
} | {
    type: FriendEventType.PIN_CREATE;
    data: TFriendEventPinCreate;
    threadId: string;
    isSelf: boolean;
} | {
    type: FriendEventType.PIN_UNPIN;
    data: TFriendEventPinUnpin;
    threadId: string;
    isSelf: boolean;
} | {
    type: FriendEventType.UNKNOWN;
    data: string;
    threadId: string;
    isSelf: boolean;
};
export declare function initializeFriendEvent(uid: string, data: TFriendEvent, type: FriendEventType): FriendEvent;
