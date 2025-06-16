export interface StickerDetailResponse {
    id: number;
    cateId: number;
    type: number;
    stickerUrl: string;
    stickerSpriteUrl: string;
    stickerWebpUrl: string | null;
}
export declare const getStickersDetailFactory: (ctx: import("../context.js").ContextBase, api: import("../zalo.js").API) => (stickerIds: number | number[]) => Promise<StickerDetailResponse[]>;
