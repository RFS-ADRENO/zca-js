export type ParseLinkMedia = {
    type: number;
    count: number;
    mediaTitle: string;
    artist: string;
    streamUrl: string;
    stream_icon: string;
};
export type ParseLinkErrorMaps = {
    [key: string]: number;
};
export type ParseLinkResponse = {
    data: any;
    thumb: string;
    title: string;
    desc: string;
    src: string;
    href: string;
    media: ParseLinkMedia;
    stream_icon: string;
    error_maps: ParseLinkErrorMaps;
};
export declare const parseLinkFactory: (ctx: import("../context.js").ContextBase, api: import("../zalo.js").API) => (link: string) => Promise<ParseLinkResponse>;
