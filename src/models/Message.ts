import { ThreadType } from "./Enum.js";

export type TAttachmentContent = {
    title: string;
    description: string;
    href: string;
    thumb: string;
    childnumber: number;
    action: string;
    params: string;
    type: string;
};

export type TOtherContent = {
    [key: string]: any;
};

export type TMessage = {
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
    topOut: string;
    topOutTimeOut: string;
    topOutImprTimeOut: string;
    propertyExt:
        | {
              color: number;
              size: number;
              type: number;
              subType: number;
              ext: string;
          }
        | undefined;
    paramsExt: {
        countUnread: number;
        containType: number;
        platformType: number;
    };
    cmd: number;
    st: number;
    at: number;
    realMsgId: string;
    quote: TQuote | undefined;
};

export type TGroupMessage = TMessage & {
    mentions: TMention[] | undefined;
};

export type TQuote = {
    ownerId: number;
    cliMsgId: number;
    globalMsgId: number;
    cliMsgType: number;
    ts: number;
    msg: string;
    attach: string;
    fromD: string;
    ttl: number;
};

export type TMention = {
    uid: string;
    pos: number;
    len: number;
    type: 0 | 1;
};

export class UserMessage {
    type: ThreadType.User = ThreadType.User;

    data: TMessage;
    threadId: string;
    /**
     * true if the message is sent by the logged in account
     */
    isSelf: boolean;

    constructor(uid: string, data: TMessage) {
        this.data = data;
        this.threadId = data.uidFrom == "0" ? data.idTo : data.uidFrom;
        this.isSelf = data.uidFrom == "0";

        if (data.idTo == "0") data.idTo = uid;
        if (data.uidFrom == "0") data.uidFrom = uid;
    }
}

export class GroupMessage {
    type: ThreadType.Group = ThreadType.Group;

    data: TGroupMessage;
    threadId: string;
    /**
     * true if the message is sent by the logged in account
     */
    isSelf: boolean;

    constructor(uid: string, data: TGroupMessage) {
        this.data = data;
        this.threadId = data.idTo;
        this.isSelf = data.uidFrom == "0";

        if (data.uidFrom == "0") data.uidFrom = uid;
    }
}


export type Message = UserMessage | GroupMessage;
