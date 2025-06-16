export var FriendEventType;
(function (FriendEventType) {
    FriendEventType[FriendEventType["ADD"] = 0] = "ADD";
    FriendEventType[FriendEventType["REMOVE"] = 1] = "REMOVE";
    FriendEventType[FriendEventType["REQUEST"] = 2] = "REQUEST";
    FriendEventType[FriendEventType["UNDO_REQUEST"] = 3] = "UNDO_REQUEST";
    FriendEventType[FriendEventType["REJECT_REQUEST"] = 4] = "REJECT_REQUEST";
    FriendEventType[FriendEventType["SEEN_FRIEND_REQUEST"] = 5] = "SEEN_FRIEND_REQUEST";
    FriendEventType[FriendEventType["BLOCK"] = 6] = "BLOCK";
    FriendEventType[FriendEventType["UNBLOCK"] = 7] = "UNBLOCK";
    FriendEventType[FriendEventType["BLOCK_CALL"] = 8] = "BLOCK_CALL";
    FriendEventType[FriendEventType["UNBLOCK_CALL"] = 9] = "UNBLOCK_CALL";
    FriendEventType[FriendEventType["PIN_UNPIN"] = 10] = "PIN_UNPIN";
    FriendEventType[FriendEventType["PIN_CREATE"] = 11] = "PIN_CREATE";
    FriendEventType[FriendEventType["UNKNOWN"] = 12] = "UNKNOWN";
})(FriendEventType || (FriendEventType = {}));
export function initializeFriendEvent(uid, data, type) {
    if (type == FriendEventType.ADD ||
        type == FriendEventType.REMOVE ||
        type == FriendEventType.BLOCK ||
        type == FriendEventType.UNBLOCK ||
        type == FriendEventType.BLOCK_CALL ||
        type == FriendEventType.UNBLOCK_CALL) {
        return {
            type,
            data: data,
            threadId: data,
            isSelf: ![FriendEventType.ADD, FriendEventType.REMOVE].includes(type),
        };
    }
    else if (type == FriendEventType.REJECT_REQUEST || type == FriendEventType.UNDO_REQUEST) {
        const threadId = data.toUid;
        return {
            type,
            data: data,
            threadId,
            isSelf: data.fromUid == uid,
        };
    }
    else if (type == FriendEventType.REQUEST) {
        const threadId = data.toUid;
        return {
            type,
            data: data,
            threadId,
            isSelf: data.fromUid == uid,
        };
    }
    else if (type == FriendEventType.SEEN_FRIEND_REQUEST) {
        return {
            type,
            data: data,
            threadId: uid,
            isSelf: true,
        };
    }
    else if (type == FriendEventType.PIN_CREATE) {
        const threadId = data.conversationId;
        return {
            type,
            data: data,
            threadId,
            isSelf: data.actorId == uid,
        };
    }
    else if (type == FriendEventType.PIN_UNPIN) {
        const threadId = data.conversationId;
        return {
            type,
            data: data,
            threadId,
            isSelf: data.actorId == uid,
        };
    }
    else {
        return {
            type: FriendEventType.UNKNOWN,
            data: JSON.stringify(data),
            threadId: "",
            isSelf: false,
        };
    }
}
