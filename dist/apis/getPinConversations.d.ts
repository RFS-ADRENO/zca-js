export type GetPinConversationsResponse = {
    conversations: string[];
    version: number;
};
export declare const getPinConversationsFactory: (ctx: import("../context.js").ContextBase, api: import("../apis.js").API) => () => Promise<GetPinConversationsResponse>;
