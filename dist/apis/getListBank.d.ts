import type { BankInfo } from "../models/index.js";
export type GetListBankResponse = {
    banks: BankInfo[];
};
export declare const getListBankFactory: (ctx: import("../context.js").ContextBase, api: import("../apis.js").API) => () => Promise<GetListBankResponse>;
