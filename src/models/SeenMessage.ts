import { ThreadType } from "./Enum.js";

export type TUserSeenMessage = {
    idTo: string;
    msgId: string;
    realMsgId: string;
};

export type TGroupSeenMessage = {
    msgId: string;
    groupId: string;
    seenUids: string[];
};

export class UserSeenMessage {
    type: ThreadType.User = ThreadType.User;

    data: TUserSeenMessage;
    threadId: string;
    isSelf: false;

    constructor(data: TUserSeenMessage) {
        this.data = data;
        this.threadId = data.idTo;
        this.isSelf = false;
    }
}

export class GroupSeenMessage {
    type: ThreadType.Group = ThreadType.Group;

    data: TGroupSeenMessage;
    threadId: string;
    isSelf: boolean;

    constructor(uid: string, data: TGroupSeenMessage) {
        this.data = data;
        this.threadId = data.groupId;
        this.isSelf = data.seenUids.includes(uid);
    }
}

export type SeenMessage = UserSeenMessage | GroupSeenMessage;
