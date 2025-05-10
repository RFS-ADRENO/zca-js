import { ThreadType } from "../models/index.js";
import type { StickerDetailResponse } from "./getStickersDetail.js";
export type SendStickerResponse = {
    msgId: number;
};
export declare const sendStickerFactory: (ctx: import("../context.js").ContextBase, api: import("../zalo.js").API) => (sticker: StickerDetailResponse, threadId: string, type?: ThreadType) => Promise<SendStickerResponse>;
