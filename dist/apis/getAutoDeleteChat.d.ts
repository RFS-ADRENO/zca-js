export type GetAutoDeleteChatResponse = {
    convers: {
        destId: string;
        isGroup: boolean;
        ttl: number;
        createdAt: number;
    }[];
};
export declare const getAutoDeleteChatFactory: (ctx: import("../context.js").ContextBase, api: import("../apis.js").API) => () => Promise<GetAutoDeleteChatResponse>;
