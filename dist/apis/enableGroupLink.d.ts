export type EnableGroupLinkResponse = {
    link: string;
    expiration_date: number;
    enabled: number;
};
export declare const enableGroupLinkFactory: (ctx: import("../context.js").ContextBase, api: import("../apis.js").API) => (groupId: string) => Promise<EnableGroupLinkResponse>;
