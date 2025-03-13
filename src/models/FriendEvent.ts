export enum FriendEventType {
    ADD,
    REMOVE,

    REQUEST,
    UNDO_REQUEST,
    REJECT_REQUEST,

    SEEN_FRIEND_REQUEST,

    BLOCK,
    UNBLOCK,
    BLOCK_CALL,
    UNBLOCK_CALL,

    PIN_UNPIN,
    PIN_CREATE,

    UNKNOWN,
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

export type TFriendEvent =
    | TFriendEventBase
    | TFriendEventRequest
    | TFriendEventRejectUndo
    | TFriendEventSeenRequest
    | TFriendEventPinUnpin
    | TFriendEventPinCreate;

export type FriendEvent =
    | {
          type:
              | FriendEventType.ADD
              | FriendEventType.REMOVE
              | FriendEventType.BLOCK
              | FriendEventType.UNBLOCK
              | FriendEventType.BLOCK_CALL
              | FriendEventType.UNBLOCK_CALL;
          data: TFriendEventBase;
          threadId: string;
          isSelf: boolean;
      }
    | {
          type: FriendEventType.REJECT_REQUEST | FriendEventType.UNDO_REQUEST;
          data: TFriendEventRejectUndo;
          threadId: string;
          isSelf: boolean;
      }
    | {
          type: FriendEventType.REQUEST;
          data: TFriendEventRequest;
          threadId: string;
          isSelf: boolean;
      }
    | {
          type: FriendEventType.SEEN_FRIEND_REQUEST;
          data: TFriendEventSeenRequest;
          threadId: string;
          isSelf: boolean;
      }
    | {
          type: FriendEventType.PIN_CREATE;
          data: TFriendEventPinCreate;
          threadId: string;
          isSelf: boolean;
      }
    | {
          type: FriendEventType.PIN_UNPIN;
          data: TFriendEventPinUnpin;
          threadId: string;
          isSelf: boolean;
      }
    | {
          type: FriendEventType.UNKNOWN;
          data: string;
          threadId: string;
          isSelf: boolean;
      };

export function initializeFriendEvent(uid: string, data: TFriendEvent, type: FriendEventType): FriendEvent {
    if (
        type == FriendEventType.ADD ||
        type == FriendEventType.REMOVE ||
        type == FriendEventType.BLOCK ||
        type == FriendEventType.UNBLOCK ||
        type == FriendEventType.BLOCK_CALL ||
        type == FriendEventType.UNBLOCK_CALL
    ) {
        return {
            type,
            data: data as TFriendEventBase,
            threadId: data as string,
            isSelf: ![FriendEventType.ADD, FriendEventType.REMOVE].includes(type),
        };
    } else if (type == FriendEventType.REJECT_REQUEST || type == FriendEventType.UNDO_REQUEST) {
        const threadId = (data as TFriendEventRejectUndo).toUid;
        return {
            type,
            data: data as TFriendEventRejectUndo,
            threadId,
            isSelf: (data as TFriendEventRequest).fromUid == uid,
        };
    } else if (type == FriendEventType.REQUEST) {
        const threadId = (data as TFriendEventRequest).toUid;
        return {
            type,
            data: data as TFriendEventRequest,
            threadId,
            isSelf: (data as TFriendEventRequest).fromUid == uid,
        };
    } else if (type == FriendEventType.SEEN_FRIEND_REQUEST) {
        return {
            type,
            data: data as TFriendEventSeenRequest,
            threadId: uid,
            isSelf: true,
        };
    } else if (type == FriendEventType.PIN_CREATE) {
        const threadId = (data as TFriendEventPinCreate).conversationId;
        return {
            type,
            data: data as TFriendEventPinCreate,
            threadId,
            isSelf: (data as TFriendEventPinCreate).actorId == uid,
        };
    } else if (type == FriendEventType.PIN_UNPIN) {
        const threadId = (data as TFriendEventPinUnpin).conversationId;
        return {
            type,
            data: data as TFriendEventPinUnpin,
            threadId,
            isSelf: (data as TFriendEventPinUnpin).actorId == uid,
        };
    } else {
        return {
            type: FriendEventType.UNKNOWN,
            data: JSON.stringify(data),
            threadId: "",
            isSelf: false,
        };
    }
}
