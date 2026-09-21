export type GetQRResponse = {
    [userId: string]: string;
};
export declare const getQRFactory: (ctx: import("../context.js").ContextBase, api: import("../apis.js").API) => (userId: string | string[]) => Promise<GetQRResponse>;
