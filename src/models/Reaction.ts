import { appContext } from "../context.js";

type TReaction = {
    actionId: string;
    msgId: string;
    cliMsgId: string;
    msgType: string;
    uidFrom: string;
    idTo: string;
    dName: string;
    content: {
        rMsg: { gMsgID: string; cMsgID: string; msgType: number }[];
        rIcon: string;
        rType: number;
        source: number;
    };
    ts: string;
    ttl: number;
};

export class Reaction {
    data: TReaction;
    threadId: string;
    isSelf: boolean;
    isGroup: boolean;

    constructor(data: TReaction, isGroup: boolean) {
        this.data = data;
        this.threadId = data.uidFrom == "0" ? data.idTo : data.uidFrom;
        this.isSelf = data.uidFrom == "0";
        this.isGroup = isGroup;

        if (data.idTo == "0") data.idTo = appContext.uid!;
        if (data.uidFrom == "0") data.uidFrom = appContext.uid!;
    }
}
