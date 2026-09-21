import type { QuickMessage, AttachmentSource } from "../models/index.js";
export type UpdateQuickMessagePayload = {
    keyword: string;
    title: string;
    media?: AttachmentSource;
};
export type UpdateQuickMessageResponse = {
    item: QuickMessage;
    version: number;
};
export declare const updateQuickMessageFactory: (ctx: import("../context.js").ContextBase, api: import("../apis.js").API) => (updatePayload: UpdateQuickMessagePayload, itemId: number) => Promise<UpdateQuickMessageResponse>;
