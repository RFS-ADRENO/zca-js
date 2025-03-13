import { ThreadType } from "./Enum.js";

export type TDeliveredMessage = {
    msgId: string;
    seen: number;
    deliveredUids: string[];
    seenUids: string[];
    realMsgId: string;
    mSTs: number;
};

export type TGroupDeliveredMessage = TDeliveredMessage & {
    groupId: string;
};

export class UserDeliveredMessage {
    type: ThreadType.User = ThreadType.User;

    data: TDeliveredMessage;
    threadId: string;
    isSelf: false;

    constructor(data: TDeliveredMessage) {
        this.data = data;
        this.threadId = data.deliveredUids[0];
        this.isSelf = false;
    }
}

export class GroupDeliveredMessage {
    type: ThreadType.Group = ThreadType.Group;

    data: TGroupDeliveredMessage;
    threadId: string;
    isSelf: boolean;

    constructor(uid: string, data: TGroupDeliveredMessage) {
        this.data = data;
        this.threadId = data.groupId;
        this.isSelf = data.deliveredUids.includes(uid);
    }
}

export type DeliveredMessage = UserDeliveredMessage | GroupDeliveredMessage;
