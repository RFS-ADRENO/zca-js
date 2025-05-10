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
export declare class UserDeliveredMessage {
    type: ThreadType.User;
    data: TDeliveredMessage;
    threadId: string;
    isSelf: false;
    constructor(data: TDeliveredMessage);
}
export declare class GroupDeliveredMessage {
    type: ThreadType.Group;
    data: TGroupDeliveredMessage;
    threadId: string;
    isSelf: boolean;
    constructor(uid: string, data: TGroupDeliveredMessage);
}
export type DeliveredMessage = UserDeliveredMessage | GroupDeliveredMessage;
