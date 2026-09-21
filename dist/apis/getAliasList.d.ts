export type GetAliasListResponse = {
    items: {
        userId: string;
        alias: string;
    }[];
    updateTime: string;
};
export declare const getAliasListFactory: (ctx: import("../context.js").ContextBase, api: import("../apis.js").API) => (count?: number, page?: number) => Promise<GetAliasListResponse>;
