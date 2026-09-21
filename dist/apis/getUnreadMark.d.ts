export type UnreadMark = {
    id: number;
    cliMsgId: number;
    fromUid: number;
    ts: number;
};
export type GetUnreadMarkResponse = {
    data: {
        convsGroup: UnreadMark[];
        convsUser: UnreadMark[];
    };
    status: number;
};
export declare const getUnreadMarkFactory: (ctx: import("../context.js").ContextBase, api: import("../apis.js").API) => () => Promise<GetUnreadMarkResponse>;
