import { ThreadType } from "./Enum.js";

export type TClearUnread = {
    idTo: string;
    isGroup: number;
    lastMsgId: string;
    type: number;
    ts?: number;
};

export class UserClearUnread {
    type: ThreadType.User = ThreadType.User;

    data: TClearUnread;
    threadId: string;

    constructor(data: TClearUnread) {
        this.data = data;
        this.threadId = data.idTo;
    }
}

export class GroupClearUnread {
    type: ThreadType.Group = ThreadType.Group;

    data: TClearUnread;
    threadId: string;

    constructor(data: TClearUnread) {
        this.data = data;
        this.threadId = data.idTo;
    }
}

export type ClearUnread = UserClearUnread | GroupClearUnread;
