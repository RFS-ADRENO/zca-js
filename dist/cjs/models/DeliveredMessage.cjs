'use strict';

var Enum = require('./Enum.cjs');

class UserDeliveredMessage {
    constructor(data) {
        this.type = Enum.ThreadType.User;
        this.data = data;
        this.threadId = data.deliveredUids[0];
        this.isSelf = false;
    }
}
class GroupDeliveredMessage {
    constructor(uid, data) {
        this.type = Enum.ThreadType.Group;
        this.data = data;
        this.threadId = data.groupId;
        this.isSelf = data.deliveredUids.includes(uid);
    }
}

exports.GroupDeliveredMessage = GroupDeliveredMessage;
exports.UserDeliveredMessage = UserDeliveredMessage;
