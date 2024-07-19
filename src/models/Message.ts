export enum MessageType {
    TEXT = 1,
}

export class Message {
    owner: string;
    id: string;
    clientId: string;
    type: MessageType;
    ts: string;
    msg: string;
    ttl: number;

    constructor(owner: string, id: string, clientId: string, type: MessageType, ts: string, msg: string, ttl: number) {
        this.owner = owner;
        this.id = id;
        this.clientId = clientId;
        this.type = type;
        this.ts = ts;
        this.msg = msg;
        this.ttl = ttl;
    }

    toJSON() {
        return {
            owner: this.owner,
            id: this.id,
            clientId: this.clientId,
            type: this.type,
            ts: this.ts,
            msg: this.msg,
            ttl: this.ttl,
        };
    }
}

export class GroupMessage {
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
    };
    paramsExt: {
        countUnread: number;
        containType: number;
        platformType: number;
    };
    cmd: number;
    st: number;
    at: number;
    realMsgId: string;

    constructor(actionId: string, msgId: string, cliMsgId: string, msgType: string, uidFrom: string, idTo: string, dName: string, ts: string, status: number, content: string, notify: string, ttl: number, userId: string, uin: string, topOut: string, topOutTimeOut: string, topOutImprTimeOut: string, propertyExt: { color: number; size: number; type: number; subType: number; ext: string; }, paramsExt: { countUnread: number; containType: number; platformType: number; }, cmd: number, st: number, at: number, realMsgId: string) {
        this.actionId = actionId;
        this.msgId = msgId;
        this.cliMsgId = cliMsgId;
        this.msgType = msgType;
        this.uidFrom = uidFrom;
        this.idTo = idTo;
        this.dName = dName;
        this.ts = ts;
        this.status = status;
        this.content = content;
        this.notify = notify;
        this.ttl = ttl;
        this.userId = userId;
        this.uin = uin;
        this.topOut = topOut;
        this.topOutTimeOut = topOutTimeOut;
        this.topOutImprTimeOut = topOutImprTimeOut;
        this.propertyExt = propertyExt;
        this.paramsExt = paramsExt;
        this.cmd = cmd;
        this.st = st;
        this.at = at;
        this.realMsgId = realMsgId;
    }

    toJSON() {
        return {
            actionId: this.actionId,
            msgId: this.msgId,
            cliMsgId: this.cliMsgId,
            msgType: this.msgType,
            uidFrom: this.uidFrom,
            idTo: this.idTo,
            dName: this.dName,
            ts: this.ts,
            status: this.status,
            content: this.content,
            notify: this.notify,
            ttl: this.ttl,
            userId: this.userId,
            uin: this.uin,
            topOut: this.topOut,
            topOutTimeOut: this.topOutTimeOut,
            topOutImprTimeOut: this.topOutImprTimeOut,
            propertyExt: this.propertyExt,
            paramsExt: this.paramsExt,
            cmd: this.cmd,
            st: this.st,
            at: this.at,
            realMsgId: this.realMsgId,
        };
    }
}
