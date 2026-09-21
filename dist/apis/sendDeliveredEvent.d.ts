import { ThreadType } from "../models/index.js";
export type SendDeliveredEventResponse = "" | {
    status: number;
};
export type SendDeliveredEventMessageParams = {
    msgId: string;
    cliMsgId: string;
    uidFrom: string;
    idTo: string;
    msgType: string;
    st: number;
    at: number;
    cmd: number;
    ts: string | number;
};
export declare const sendDeliveredEventFactory: (ctx: import("../context.js").ContextBase, api: import("../apis.js").API) => (isSeen: boolean, messages: SendDeliveredEventMessageParams | SendDeliveredEventMessageParams[], type?: ThreadType) => Promise<SendDeliveredEventResponse>;
