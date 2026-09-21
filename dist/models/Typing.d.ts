import { ThreadType } from "./Enum.js";
export type TTyping = {
    uid: string;
    ts: string;
    isPC: 0 | 1;
};
export type TGroupTyping = TTyping & {
    gid: string;
};
export declare class UserTyping {
    type: ThreadType.User;
    data: TTyping;
    threadId: string;
    isSelf: false;
    constructor(data: TTyping);
}
export declare class GroupTyping {
    type: ThreadType.Group;
    data: TGroupTyping;
    threadId: string;
    isSelf: false;
    constructor(data: TGroupTyping);
}
export type Typing = UserTyping | GroupTyping;
