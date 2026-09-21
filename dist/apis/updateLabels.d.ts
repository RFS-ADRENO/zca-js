import type { LabelData } from "../models/index.js";
export type UpdateLabelsPayload = {
    labelData: LabelData[];
    version: number;
};
export type UpdateLabelsResponse = {
    labelData: LabelData[];
    version: number;
    lastUpdateTime: number;
};
export declare const updateLabelsFactory: (ctx: import("../context.js").ContextBase, api: import("../apis.js").API) => (payload: UpdateLabelsPayload) => Promise<{
    labelData: any;
    version: number;
    lastUpdateTime: number;
}>;
