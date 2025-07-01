export type ConversInfo = {
    destId: string;
    isGroup: boolean;
    ttl: number;
    createdAt: number;
};
export type GetAutoDeleteChatResponse = {
    convers: ConversInfo[];
};
export declare const getAutoDeleteChatFactory: (ctx: import("../context.js").ContextBase, api: import("../zalo.js").API) => () => Promise<GetAutoDeleteChatResponse>;
