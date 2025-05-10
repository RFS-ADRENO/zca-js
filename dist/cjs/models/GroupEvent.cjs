'use strict';

exports.GroupEventType = void 0;
(function (GroupEventType) {
    GroupEventType[GroupEventType["JOIN_REQUEST"] = 0] = "JOIN_REQUEST";
    GroupEventType[GroupEventType["JOIN"] = 1] = "JOIN";
    GroupEventType[GroupEventType["LEAVE"] = 2] = "LEAVE";
    GroupEventType[GroupEventType["REMOVE_MEMBER"] = 3] = "REMOVE_MEMBER";
    GroupEventType[GroupEventType["BLOCK_MEMBER"] = 4] = "BLOCK_MEMBER";
    GroupEventType[GroupEventType["UPDATE_SETTING"] = 5] = "UPDATE_SETTING";
    GroupEventType[GroupEventType["UPDATE"] = 6] = "UPDATE";
    GroupEventType[GroupEventType["NEW_LINK"] = 7] = "NEW_LINK";
    GroupEventType[GroupEventType["ADD_ADMIN"] = 8] = "ADD_ADMIN";
    GroupEventType[GroupEventType["REMOVE_ADMIN"] = 9] = "REMOVE_ADMIN";
    GroupEventType[GroupEventType["NEW_PIN_TOPIC"] = 10] = "NEW_PIN_TOPIC";
    GroupEventType[GroupEventType["UPDATE_PIN_TOPIC"] = 11] = "UPDATE_PIN_TOPIC";
    GroupEventType[GroupEventType["REORDER_PIN_TOPIC"] = 12] = "REORDER_PIN_TOPIC";
    GroupEventType[GroupEventType["UPDATE_BOARD"] = 13] = "UPDATE_BOARD";
    GroupEventType[GroupEventType["REMOVE_BOARD"] = 14] = "REMOVE_BOARD";
    GroupEventType[GroupEventType["UPDATE_TOPIC"] = 15] = "UPDATE_TOPIC";
    GroupEventType[GroupEventType["UNPIN_TOPIC"] = 16] = "UNPIN_TOPIC";
    GroupEventType[GroupEventType["REMOVE_TOPIC"] = 17] = "REMOVE_TOPIC";
    GroupEventType[GroupEventType["ACCEPT_REMIND"] = 18] = "ACCEPT_REMIND";
    GroupEventType[GroupEventType["REJECT_REMIND"] = 19] = "REJECT_REMIND";
    GroupEventType[GroupEventType["REMIND_TOPIC"] = 20] = "REMIND_TOPIC";
    GroupEventType[GroupEventType["UNKNOWN"] = 21] = "UNKNOWN";
})(exports.GroupEventType || (exports.GroupEventType = {}));
function initializeGroupEvent(uid, data, type) {
    const threadId = "group_id" in data ? data.group_id : data.groupId;
    if (type == exports.GroupEventType.JOIN_REQUEST) {
        return { type, data: data, threadId, isSelf: false };
    }
    else if (type == exports.GroupEventType.NEW_PIN_TOPIC ||
        type == exports.GroupEventType.UNPIN_TOPIC ||
        type == exports.GroupEventType.UPDATE_PIN_TOPIC) {
        return {
            type,
            data: data,
            threadId,
            isSelf: data.actorId == uid,
        };
    }
    else if (type == exports.GroupEventType.REORDER_PIN_TOPIC) {
        return {
            type,
            data: data,
            threadId,
            isSelf: data.actorId == uid,
        };
    }
    else if (type == exports.GroupEventType.UPDATE_BOARD || type == exports.GroupEventType.REMOVE_BOARD) {
        return {
            type,
            data: data,
            threadId,
            isSelf: data.sourceId == uid,
        };
    }
    else if (type == exports.GroupEventType.ACCEPT_REMIND || type == exports.GroupEventType.REJECT_REMIND) {
        return {
            type,
            data: data,
            threadId,
            isSelf: data.updateMembers.some((memberId) => memberId == uid),
        };
    }
    else if (type == exports.GroupEventType.REMIND_TOPIC) {
        return {
            type,
            data: data,
            threadId,
            isSelf: data.creatorId == uid,
        };
    }
    else {
        const baseData = data;
        return {
            type,
            data: baseData,
            threadId,
            isSelf: baseData.updateMembers.some((member) => member.id == uid) || baseData.sourceId == uid,
        };
    }
}

exports.initializeGroupEvent = initializeGroupEvent;
