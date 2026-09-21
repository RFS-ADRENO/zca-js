export type ScanURLResponse = {
    isSafe: boolean;
};
export declare const scanURLFactory: (ctx: import("../context.js").ContextBase, api: import("../apis.js").API) => (url: string) => Promise<ScanURLResponse>;
