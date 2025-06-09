export type ThreadInfo = {
    is_group: number;
    thread_id: string;
};
export type GetHiddenConversPinResponse = {
    pin: string;
    threads: ThreadInfo[];
};
export declare const getHiddenConversPinFactory: (ctx: import("../context.js").ContextBase, api: import("../zalo.js").API) => () => Promise<GetHiddenConversPinResponse>;
