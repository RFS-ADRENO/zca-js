import type { BankAccount, BinBankCard } from "../models/index.js";
export type CreateBankAccountPayload = {
    binBank: BinBankCard;
    numAccBank: string;
    nameAccBank: string;
};
export type CreateBankAccountResponse = BankAccount;
export declare const createBankAccountFactory: (ctx: import("../context.js").ContextBase, api: import("../apis.js").API) => (payload: CreateBankAccountPayload) => Promise<BankAccount>;
