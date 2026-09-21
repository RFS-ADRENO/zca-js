import type { LabelData } from "../models/index.js";
export type GetLabelsResponse = {
    labelData: LabelData[];
    version: number;
    lastUpdateTime: number;
};
export declare const getLabelsFactory: (ctx: import("../context.js").ContextBase, api: import("../apis.js").API) => () => Promise<GetLabelsResponse>;
