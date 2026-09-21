export type UpdateActiveStatusResponse = {
    status: boolean;
};
export declare const updateActiveStatusFactory: (ctx: import("../context.js").ContextBase, api: import("../apis.js").API) => (active: boolean) => Promise<UpdateActiveStatusResponse>;
