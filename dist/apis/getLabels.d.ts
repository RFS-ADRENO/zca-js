export type GetLabelsResponse = {
    labelData: {
        id: number;
        text: string;
        textKey: string;
        conversations: string[];
        color: string;
        offset: number;
        emoji: string;
        createTime: number;
    }[];
    version: number;
    lastUpdateTime: number;
};
export declare const getLabelsFactory: (ctx: import("../context.js").ContextBase, api: import("../zalo.js").API) => () => Promise<{
    labelData: any;
    version: number;
    lastUpdateTime: number;
}>;
