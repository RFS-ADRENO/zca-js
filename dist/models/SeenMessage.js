import { ThreadType } from "./Enum.js";
export class UserSeenMessage {
    constructor(data) {
        this.type = ThreadType.User;
        this.data = data;
        this.threadId = data.idTo;
        this.isSelf = false;
    }
}
export class GroupSeenMessage {
    constructor(uid, data) {
        this.type = ThreadType.Group;
        this.data = data;
        this.threadId = data.groupId;
        this.isSelf = data.seenUids.includes(uid);
    }
}
