import { appContext } from "../context.js";

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
    quote: TQuote | undefined;
}

export type TGroupMessage = {
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
    mentions: TMention[] | undefined;
    quote: TQuote | undefined;
}

export type TQuote = {
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

export type TMention = {
    uid: string;
    pos: number;
    len: number;
    type: 0 | 1;
};

export enum MessageType {
    Message,
    GroupMessage
}

export class Message {
    data: TMessage;
    type: MessageType = MessageType.Message;

    constructor(data: TMessage) {
        this.data = data;
        if (data.idTo == "0") data.idTo = appContext.uid!;
        if (data.uidFrom == "0") data.uidFrom = appContext.uid!;
    }
}

export class GroupMessage {
    data: TGroupMessage
    type: MessageType = MessageType.GroupMessage;

    constructor(data: TGroupMessage) {
        this.data = data;
        if (data.uidFrom == "0") data.uidFrom = appContext.uid!;
    }
}
