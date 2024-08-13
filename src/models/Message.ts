export type MessageType = {
    actionId: string;
    msgId: string;
    cliMsgId: string;
    msgType: string;
    idTo: string;
    dName: string;
    ts: string;
    status: number;
    content: string;
    notify: string;
    ttl: number;
    userId: string;
    uin: string;
    topOut: string;
    topOutTimeOut: string;
    topOutImprTimeOut: string;
    propertyExt: {
        color: number;
        size: number;
        type: number;
        subType: number;
        ext: string;
    } | undefined;
    paramsExt: {
        countUnread: number;
        containType: number;
        platformType: number;
    };
    cmd: number;
    st: number;
    at: number;
    realMsgId: string;
}

export type GroupMessageType = {
    actionId: string;
    msgId: string;
    cliMsgId: string;
    msgType: string;
    idTo: string;
    uidFrom: string;
    dName: string;
    ts: string;
    status: number;
    content: string;
    notify: string;
    ttl: number;
    userId: string;
    uin: string;
    topOut: string;
    topOutTimeOut: string;
    topOutImprTimeOut: string;
    propertyExt: {
        color: number;
        size: number;
        type: number;
        subType: number;
        ext: string;
    } | undefined;
    paramsExt: {
        countUnread: number;
        containType: number;
        platformType: number;
    };
    cmd: number;
    st: number;
    at: number;
    realMsgId: string;
    mentions: MentionType[] | undefined;
    quote: QuoteType | undefined;
}

export type QuoteType = {
    ownerId: number;
    cliId: number;
    globalMsgId: number;
    cliMsgType: number;
    ts: number;
    msg: string;
    attach: string;
    fromD: string;
    ttl: number
}

export type MentionType = {
    uid: string;
    pos: number;
    len: number;
    type: 0 | 1;
};

export class Message {
    data: MessageType;

    constructor(data: MessageType) {
        this.data = data;
    }

    toJSON() {
        return this.data;
    }
}

export class GroupMessage {
    data: GroupMessageType

    constructor(data: GroupMessageType) {
        this.data = data;
    }

    toJSON() {
        return this.data;
    }
}
