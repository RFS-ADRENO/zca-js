export type LostFocusResponse = {
    status: boolean;
};
export declare const lostFocusFactory: (ctx: import("../context.js").ContextBase, api: import("../apis.js").API) => () => Promise<LostFocusResponse>;
