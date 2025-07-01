import { ThreadType } from "./Enum.js";
export class UserMessage {
    constructor(uid, data) {
        this.type = ThreadType.User;
        this.data = data;
        this.threadId = data.uidFrom == "0" ? data.idTo : data.uidFrom;
        this.isSelf = data.uidFrom == "0";
        if (data.idTo == "0")
            data.idTo = uid;
        if (data.uidFrom == "0")
            data.uidFrom = uid;
    }
}
export class GroupMessage {
    constructor(uid, data) {
        this.type = ThreadType.Group;
        this.data = data;
        this.threadId = data.idTo;
        this.isSelf = data.uidFrom == "0";
        if (data.uidFrom == "0")
            data.uidFrom = uid;
    }
}
