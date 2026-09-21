import type { BankAccount } from "../models/index.js";
export type GetListBankAccountResponse = {
    hasMore: boolean;
    total: number;
    myBanks: BankAccount[];
};
export declare const getListBankAccountFactory: (ctx: import("../context.js").ContextBase, api: import("../apis.js").API) => (page?: number, limit?: number) => Promise<GetListBankAccountResponse>;
