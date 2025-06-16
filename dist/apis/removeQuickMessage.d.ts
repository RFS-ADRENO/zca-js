export type RemoveQuickMessageResponse = {
    itemIds: number[];
    version: number;
};
export declare const removeQuickMessageFactory: (ctx: import("../context.js").ContextBase, api: import("../zalo.js").API) => (itemIds: number | number[]) => Promise<RemoveQuickMessageResponse>;
