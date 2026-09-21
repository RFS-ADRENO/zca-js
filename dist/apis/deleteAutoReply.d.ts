export type DeleteAutoReplyResponse = {
    item: number;
    version: number;
};
export declare const deleteAutoReplyFactory: (ctx: import("../context.js").ContextBase, api: import("../apis.js").API) => (id: number) => Promise<DeleteAutoReplyResponse>;
