import { ThreadType } from "./Enum.js";
export class UserDeliveredMessage {
    constructor(data) {
        this.type = ThreadType.User;
        this.data = data;
        this.threadId = data.deliveredUids[0];
        this.isSelf = false;
    }
}
export class GroupDeliveredMessage {
    constructor(uid, data) {
        this.type = ThreadType.Group;
        this.data = data;
        this.threadId = data.groupId;
        this.isSelf = data.deliveredUids.includes(uid);
    }
}
