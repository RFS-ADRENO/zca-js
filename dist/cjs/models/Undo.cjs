'use strict';

class Undo {
    constructor(uid, data, isGroup) {
        this.data = data;
        this.threadId = isGroup || data.uidFrom == "0" ? data.idTo : data.uidFrom;
        this.isSelf = data.uidFrom == "0";
        this.isGroup = isGroup;
        if (data.idTo == "0")
            data.idTo = uid;
        if (data.uidFrom == "0")
            data.uidFrom = uid;
    }
}

exports.Undo = Undo;
