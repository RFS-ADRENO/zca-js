import { ThreadType } from "../models/index.js";
export type SendStickerPayload = {
    id: number;
    cateId: number;
    type: number;
};
export type SendStickerResponse = {
    msgId: number;
};
export declare const sendStickerFactory: (ctx: import("../context.js").ContextBase, api: import("../apis.js").API) => (sticker: SendStickerPayload, threadId: string, type?: ThreadType) => Promise<SendStickerResponse>;
