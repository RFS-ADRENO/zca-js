type parseLinkMedia = {
    type: number;
    count: number;
    mediaTitle: string;
    artist: string;
    streamUrl: string;
    stream_icon: string;
};
type errorMaps = {
    [key: string]: number;
};
export type ParseLinkResponse = {
    thumb: string;
    title: string;
    desc: string;
    src: string;
    href: string;
    media: parseLinkMedia;
    stream_icon: string;
    error_maps: errorMaps;
};
export declare const parseLinkFactory: (ctx: import("../context.js").ContextBase, api: import("../zalo.js").API) => (link: string) => Promise<ParseLinkResponse>;
export {};
