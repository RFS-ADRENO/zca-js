export type UpdateLabelParams = {
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
};
export type UpdateLabelsResponse = {
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
export declare const updateLabelsFactory: (ctx: import("../context.js").ContextBase, api: import("../zalo.js").API) => (label: UpdateLabelParams) => Promise<{
    labelData: any;
    version: number;
    lastUpdateTime: number;
}>;
