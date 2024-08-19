import { appContext } from "../context.js";
import { TAttachmentContent, TOtherContent } from "./Message.js";

export type TUndo = {
    actionId: string;
    msgId: string;
    cliMsgId: string;
    msgType: string;
    uidFrom: string;
    idTo: string;
    dName: string;
    ts: string;
    status: number;
    content: string | TAttachmentContent | TOtherContent;
    notify: string;
    ttl: number;
    userId: string;
    uin: string;
    cmd: number;
    st: number;
    at: number;
    realMsgId: string;
};

export class Undo {
    data: TUndo;
    threadId: string;
    isSelf: boolean;
    isGroup: boolean;

    constructor(data: TUndo, isGroup: boolean) {
        this.data = data;
        this.threadId = data.uidFrom == "0" ? data.idTo : data.uidFrom;
        this.isSelf = data.uidFrom == "0";
        this.isGroup = isGroup;

        if (data.idTo == "0") data.idTo = appContext.uid!;
        if (data.uidFrom == "0") data.uidFrom = appContext.uid!;
    }
}
