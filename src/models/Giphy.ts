export type GiphyGifMedia = {
    width: number;
    height: number;
    url: string;
};

export type GiphyDictionary = {
    id: string;
    enKeywords: string[];
    viKeywords: string[];
};

export type GiphyCategory = {
    id: number;
    name: string;
    enName: string;
    icon: string;
    type: number;
    keywords: string[];
};

export type GiphyGif = {
    id: string;
    original: GiphyGifMedia;
    normal: GiphyGifMedia;
    hd: GiphyGifMedia;
    preview: GiphyGifMedia;
};
