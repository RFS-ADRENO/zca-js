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
export declare class UserSeenMessage {
    type: ThreadType.User;
    data: TUserSeenMessage;
    threadId: string;
    isSelf: false;
    constructor(data: TUserSeenMessage);
}
export declare class GroupSeenMessage {
    type: ThreadType.Group;
    data: TGroupSeenMessage;
    threadId: string;
    isSelf: boolean;
    constructor(uid: string, data: TGroupSeenMessage);
}
export type SeenMessage = UserSeenMessage | GroupSeenMessage;
