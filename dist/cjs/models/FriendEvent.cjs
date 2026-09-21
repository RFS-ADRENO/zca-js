'use strict';

exports.FriendEventType = void 0;
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
})(exports.FriendEventType || (exports.FriendEventType = {}));
function initializeFriendEvent(uid, data, type) {
    if (type == exports.FriendEventType.ADD ||
        type == exports.FriendEventType.REMOVE ||
        type == exports.FriendEventType.BLOCK ||
        type == exports.FriendEventType.UNBLOCK ||
        type == exports.FriendEventType.BLOCK_CALL ||
        type == exports.FriendEventType.UNBLOCK_CALL) {
        return {
            type,
            data: data,
            threadId: data,
            isSelf: ![exports.FriendEventType.ADD, exports.FriendEventType.REMOVE].includes(type),
        };
    }
    else if (type == exports.FriendEventType.REJECT_REQUEST || type == exports.FriendEventType.UNDO_REQUEST) {
        const threadId = data.toUid;
        return {
            type,
            data: data,
            threadId,
            isSelf: data.fromUid == uid,
        };
    }
    else if (type == exports.FriendEventType.REQUEST) {
        const threadId = data.toUid;
        return {
            type,
            data: data,
            threadId,
            isSelf: data.fromUid == uid,
        };
    }
    else if (type == exports.FriendEventType.SEEN_FRIEND_REQUEST) {
        return {
            type,
            data: data,
            threadId: uid,
            isSelf: true,
        };
    }
    else if (type == exports.FriendEventType.PIN_CREATE) {
        const threadId = data.conversationId;
        return {
            type,
            data: data,
            threadId,
            isSelf: data.actorId == uid,
        };
    }
    else if (type == exports.FriendEventType.PIN_UNPIN) {
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
            type: exports.FriendEventType.UNKNOWN,
            data: JSON.stringify(data),
            threadId: "",
            isSelf: false,
        };
    }
}

exports.initializeFriendEvent = initializeFriendEvent;
