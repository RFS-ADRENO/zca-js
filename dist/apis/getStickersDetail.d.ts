import type { StickerDetail } from "../models/index.js";
export type StickerDetailResponse = StickerDetail[];
export declare const getStickersDetailFactory: (ctx: import("../context.js").ContextBase, api: import("../apis.js").API) => (stickerIds: number | number[]) => Promise<StickerDetailResponse>;
