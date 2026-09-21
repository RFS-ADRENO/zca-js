'use strict';

exports.GroupEventType = void 0;
(function (GroupEventType) {
    GroupEventType["JOIN_REQUEST"] = "join_request";
    GroupEventType["JOIN"] = "join";
    GroupEventType["LEAVE"] = "leave";
    GroupEventType["REMOVE_MEMBER"] = "remove_member";
    GroupEventType["BLOCK_MEMBER"] = "block_member";
    GroupEventType["UPDATE_SETTING"] = "update_setting";
    GroupEventType["UPDATE"] = "update";
    GroupEventType["NEW_LINK"] = "new_link";
    GroupEventType["ADD_ADMIN"] = "add_admin";
    GroupEventType["REMOVE_ADMIN"] = "remove_admin";
    GroupEventType["NEW_PIN_TOPIC"] = "new_pin_topic";
    GroupEventType["UPDATE_PIN_TOPIC"] = "update_pin_topic";
    GroupEventType["REORDER_PIN_TOPIC"] = "reorder_pin_topic";
    GroupEventType["UPDATE_BOARD"] = "update_board";
    GroupEventType["REMOVE_BOARD"] = "remove_board";
    GroupEventType["UPDATE_TOPIC"] = "update_topic";
    GroupEventType["UNPIN_TOPIC"] = "unpin_topic";
    GroupEventType["REMOVE_TOPIC"] = "remove_topic";
    GroupEventType["ACCEPT_REMIND"] = "accept_remind";
    GroupEventType["REJECT_REMIND"] = "reject_remind";
    GroupEventType["REMIND_TOPIC"] = "remind_topic";
    GroupEventType["UPDATE_AVATAR"] = "update_avatar";
    GroupEventType["UNKNOWN"] = "unknown";
})(exports.GroupEventType || (exports.GroupEventType = {}));
function initializeGroupEvent(uid, data, type, act) {
    var _a;
    const threadId = "group_id" in data ? data.group_id : data.groupId;
    if (type == exports.GroupEventType.JOIN_REQUEST) {
        return { type, act, data: data, threadId, isSelf: false };
    }
    else if (type == exports.GroupEventType.NEW_PIN_TOPIC ||
        type == exports.GroupEventType.UNPIN_TOPIC ||
        type == exports.GroupEventType.UPDATE_PIN_TOPIC) {
        return {
            type,
            act,
            data: data,
            threadId,
            isSelf: data.actorId == uid,
        };
    }
    else if (type == exports.GroupEventType.REORDER_PIN_TOPIC) {
        return {
            type,
            act,
            data: data,
            threadId,
            isSelf: data.actorId == uid,
        };
    }
    else if (type == exports.GroupEventType.UPDATE_BOARD || type == exports.GroupEventType.REMOVE_BOARD) {
        return {
            type,
            act,
            data: data,
            threadId,
            isSelf: data.sourceId == uid,
        };
    }
    else if (type == exports.GroupEventType.ACCEPT_REMIND || type == exports.GroupEventType.REJECT_REMIND) {
        return {
            type,
            act,
            data: data,
            threadId,
            isSelf: data.updateMembers.some((memberId) => memberId == uid),
        };
    }
    else if (type == exports.GroupEventType.REMIND_TOPIC) {
        return {
            type,
            act,
            data: data,
            threadId,
            isSelf: data.creatorId == uid,
        };
    }
    else {
        const baseData = data;
        return {
            type,
            act,
            data: baseData,
            threadId,
            isSelf: ((_a = baseData.updateMembers) === null || _a === void 0 ? void 0 : _a.some((member) => member.id == uid)) || baseData.sourceId == uid,
        };
    }
}

exports.initializeGroupEvent = initializeGroupEvent;
