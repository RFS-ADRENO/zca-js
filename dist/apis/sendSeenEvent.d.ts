import { ThreadType } from "../models/index.js";
export type SendSeenEventResponse = {
    status: number;
};
export type SendSeenEventMessageParams = {
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
export declare const sendSeenEventFactory: (ctx: import("../context.js").ContextBase, api: import("../apis.js").API) => (messages: SendSeenEventMessageParams | SendSeenEventMessageParams[], type?: ThreadType) => Promise<SendSeenEventResponse>;
