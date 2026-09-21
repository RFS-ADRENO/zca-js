import type { StickerDetail } from "../models/index.js";
export type GetStickerCategoryDetailResponse = StickerDetail[];
export declare const getStickerCategoryDetailFactory: (ctx: import("../context.js").ContextBase, api: import("../apis.js").API) => (cateId: number) => Promise<GetStickerCategoryDetailResponse>;
