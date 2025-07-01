'use strict';

var Enum = require('./Enum.cjs');

class UserMessage {
    constructor(uid, data) {
        this.type = Enum.ThreadType.User;
        this.data = data;
        this.threadId = data.uidFrom == "0" ? data.idTo : data.uidFrom;
        this.isSelf = data.uidFrom == "0";
        if (data.idTo == "0")
            data.idTo = uid;
        if (data.uidFrom == "0")
            data.uidFrom = uid;
    }
}
class GroupMessage {
    constructor(uid, data) {
        this.type = Enum.ThreadType.Group;
        this.data = data;
        this.threadId = data.idTo;
        this.isSelf = data.uidFrom == "0";
        if (data.uidFrom == "0")
            data.uidFrom = uid;
    }
}

exports.GroupMessage = GroupMessage;
exports.UserMessage = UserMessage;
