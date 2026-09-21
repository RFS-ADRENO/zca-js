import type { StickerBasic } from "../models/index.js";
export type SearchStickerResponse = StickerBasic[];
export declare const searchStickerFactory: (ctx: import("../context.js").ContextBase, api: import("../apis.js").API) => (keyword: string, limit?: number) => Promise<SearchStickerResponse>;
