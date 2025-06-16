export type GetUnreadMarkResponse = {
    data: string;
    status: number;
};
export declare const getUnreadMarkFactory: (ctx: import("../context.js").ContextBase, api: import("../zalo.js").API) => () => Promise<GetUnreadMarkResponse>;
