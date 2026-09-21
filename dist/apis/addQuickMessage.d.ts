import type { QuickMessage, AttachmentSource } from "../models/index.js";
export type AddQuickMessagePayload = {
    keyword: string;
    title: string;
    media?: AttachmentSource;
};
export type AddQuickMessageResponse = {
    item: QuickMessage;
    version: number;
};
export declare const addQuickMessageFactory: (ctx: import("../context.js").ContextBase, api: import("../apis.js").API) => (addPayload: AddQuickMessagePayload) => Promise<AddQuickMessageResponse>;
