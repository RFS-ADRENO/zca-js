'use strict';

var Enum = require('./Enum.cjs');

class UserSeenMessage {
    constructor(data) {
        this.type = Enum.ThreadType.User;
        this.data = data;
        this.threadId = data.idTo;
        this.isSelf = false;
    }
}
class GroupSeenMessage {
    constructor(uid, data) {
        this.type = Enum.ThreadType.Group;
        this.data = data;
        this.threadId = data.groupId;
        this.isSelf = data.seenUids.includes(uid);
    }
}

exports.GroupSeenMessage = GroupSeenMessage;
exports.UserSeenMessage = UserSeenMessage;
