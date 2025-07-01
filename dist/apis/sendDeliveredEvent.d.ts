import { ThreadType } from "../models/Enum.js";
export type SendDeliveredEventResponse = "" | {
    status: number;
};
export type DeliveredEventMessageParams = {
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
export declare const sendDeliveredEventFactory: (ctx: import("../context.js").ContextBase, api: import("../zalo.js").API) => (type: ThreadType, messages: DeliveredEventMessageParams[], isSeen?: boolean) => Promise<SendDeliveredEventResponse>;
