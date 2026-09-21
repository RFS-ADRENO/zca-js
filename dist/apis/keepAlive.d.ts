export type KeepAliveResponse = {
    config_vesion: number;
};
export declare const keepAliveFactory: (ctx: import("../context.js").ContextBase, api: import("../apis.js").API) => () => Promise<KeepAliveResponse>;
