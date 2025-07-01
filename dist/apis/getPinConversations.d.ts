export type GetPinConversationsResponse = {
    conversations: string[];
    version: number;
};
export declare const getPinConversationsFactory: (ctx: import("../context.js").ContextBase, api: import("../zalo.js").API) => () => Promise<GetPinConversationsResponse>;
