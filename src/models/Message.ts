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
