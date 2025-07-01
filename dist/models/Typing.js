import { ThreadType } from "./Enum.js";
export class UserTyping {
    constructor(data) {
        this.type = ThreadType.User;
        this.data = data;
        this.threadId = data.uid;
        this.isSelf = false;
    }
}
export class GroupTyping {
    constructor(data) {
        this.type = ThreadType.Group;
        this.data = data;
        this.threadId = data.gid;
        this.isSelf = false;
    }
}
