export type GetAliasListResponse = {
    items: {
        userId: string;
        alias: string;
    }[];
    updateTime: string;
};
export declare const getAliasListFactory: (ctx: import("../context.js").ContextBase, api: import("../zalo.js").API) => (count?: number, page?: number) => Promise<GetAliasListResponse>;
