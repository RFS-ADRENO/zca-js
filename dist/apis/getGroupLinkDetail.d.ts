export type GetGroupLinkDetailResponse = {
    link?: string;
    expiration_date?: number;
    /**
     * 1: enabled, 0: disabled
     */
    enabled: number;
};
export declare const getGroupLinkDetailFactory: (ctx: import("../context.js").ContextBase, api: import("../apis.js").API) => (groupId: string) => Promise<GetGroupLinkDetailResponse>;
