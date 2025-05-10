'use strict';

var Enum = require('./Enum.cjs');

class UserTyping {
    constructor(data) {
        this.type = Enum.ThreadType.User;
        this.data = data;
        this.threadId = data.uid;
        this.isSelf = false;
    }
}
class GroupTyping {
    constructor(data) {
        this.type = Enum.ThreadType.Group;
        this.data = data;
        this.threadId = data.gid;
        this.isSelf = false;
    }
}

exports.GroupTyping = GroupTyping;
exports.UserTyping = UserTyping;
