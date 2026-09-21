export type GetArchivedChatListResponse = {
    items: unknown[];
    version: number;
};
export declare const getArchivedChatListFactory: (ctx: import("../context.js").ContextBase, api: import("../apis.js").API) => () => Promise<GetArchivedChatListResponse>;
