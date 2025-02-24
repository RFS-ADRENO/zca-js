import { ThreadType } from "./Enum.js";

export type TTyping = {
    uid: string;
    ts: string;
    isPC: 0 | 1;
};

export type TGroupTyping = TTyping & {
    gid: string;
};

export class UserTyping {
    type: ThreadType.User = ThreadType.User;

    data: TTyping;
    threadId: string;
    isSelf: false;

    constructor(data: TTyping) {
        this.data = data;
        this.threadId = data.uid;
        this.isSelf = false;
    }
}

export class GroupTyping {
    type: ThreadType.Group = ThreadType.Group;

    data: TGroupTyping;
    threadId: string;
    isSelf: false;

    constructor(data: TGroupTyping) {
        this.data = data;
        this.threadId = data.gid;
        this.isSelf = false;
    }
}

export type Typing = UserTyping | GroupTyping;
