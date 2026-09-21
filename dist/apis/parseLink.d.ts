export type ParseLinkErrorMaps = Record<string, number>;
export type ParseLinkResponse = {
    data: {
        thumb: string;
        title: string;
        desc: string;
        src: string;
        href: string;
        media: {
            type: number;
            count: number;
            mediaTitle: string;
            artist: string;
            streamUrl: string;
            stream_icon: string;
        };
        stream_icon: string;
    };
    error_maps: ParseLinkErrorMaps;
};
export declare const parseLinkFactory: (ctx: import("../context.js").ContextBase, api: import("../apis.js").API) => (link: string) => Promise<ParseLinkResponse>;
