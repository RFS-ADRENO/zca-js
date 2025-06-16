import { ThreadType } from "../models/Enum.js";
export type SendSeenEventResponse = {
    status: number;
};
export type SeenEventMessageParams = {
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
export declare const sendSeenEventFactory: (ctx: import("../context.js").ContextBase, api: import("../zalo.js").API) => (type: ThreadType, targetId: string, messages: SeenEventMessageParams[]) => Promise<SendSeenEventResponse>;
