export type GetAllGroupsResponse = {
    version: string;
    gridInfoMap: Record<string, string>;
};
export declare const getAllGroupsFactory: (ctx: import("../context.js").ContextBase, api: import("../zalo.js").API) => () => Promise<GetAllGroupsResponse>;
