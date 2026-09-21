import type { BankAccount, BinBankCard } from "../models/index.js";
export type UpdateBankAccountPayload = {
    accountId: number;
    binBank: BinBankCard;
    numAccBank: string;
    nameAccBank: string;
};
export type UpdateBankAccountResponse = BankAccount;
export declare const updateBankAccountFactory: (ctx: import("../context.js").ContextBase, api: import("../apis.js").API) => (payload: UpdateBankAccountPayload) => Promise<BankAccount>;
