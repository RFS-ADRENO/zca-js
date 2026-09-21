import type { BinBankCard } from "../models/index.js";
import { ThreadType } from "../models/index.js";
export type SendBankCardPayload = {
    binBank: BinBankCard;
    numAccBank: string;
    nameAccBank?: string;
};
export type SendBankCardResponse = "";
export declare const sendBankCardFactory: (ctx: import("../context.js").ContextBase, api: import("../apis.js").API) => (payload: SendBankCardPayload, threadId: string, type?: ThreadType) => Promise<"">;
