export type KeepAliveResponse = {
    config_vesion: number;
};
export declare const keepAliveFactory: (ctx: import("../context.js").ContextBase, api: import("../zalo.js").API) => () => Promise<KeepAliveResponse>;
