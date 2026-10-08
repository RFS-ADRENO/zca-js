export type StickerDetail = {
    id: number;
    cateId: number;
    type: number;
    text: string;
    uri: string;
    fkey: number;
    status: number;
    stickerUrl: string;
    stickerSpriteUrl: string;
    stickerWebpUrl: string | null;
    totalFrames: number;
    duration: number;
    effectId: number;
    checksum: string;
    ext: number;
    source: number;
    fss: unknown;
    fssInfo: unknown;
    version: number;
    extInfo: unknown;
};

export type StickerBasic = {
    type: number;
    cate_id: number;
    sticker_id: number;
};

export type TenorSticker = {
  id: string;
  cid: number;
  eid: number;
};

export type GifMedia = {
    width: number;
    height: number;
    url: string;
}

export type CategoryDetail = {
    id: number;
    name: string;
    desc: string;
    totalImage: number;
    thumbUrl: string;
    iconUrl: string;
    iconPreview: string;
    price: number;
    group: number;
    status: number;
    version: number;
    thumbImg: string;
    source: string;
    type: number;
    sourceUrl: string;
    permission: number;
    expireTime: number;
    is_hidden: number;
    order: number;
};
