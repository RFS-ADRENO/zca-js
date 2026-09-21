import type { BankAccount } from "../models/index.js";
export type DeleteBankAccountPayload = {
    accountId: number;
    isDefault: boolean;
};
export type DeleteBankAccountResponse = {
    hasMore: boolean;
    total: number;
    myBanks: BankAccount[];
};
export declare const deleteBankAccountFactory: (ctx: import("../context.js").ContextBase, api: import("../apis.js").API) => (payload: DeleteBankAccountPayload) => Promise<DeleteBankAccountResponse>;
