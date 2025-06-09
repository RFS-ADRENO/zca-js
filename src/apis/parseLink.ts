import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type ParseLinkMedia = {
    type: number;
    count: number;
    mediaTitle: string;
    artist: string;
    streamUrl: string;
    stream_icon: string;
};

export type ParseLinkErrorMaps = {
    [key: string]: number; // or Record<string, number>;
};

export type ParseLinkResponse = {
    data: any; // @TODO: add for sendLink
    thumb: string;
    title: string;
    desc: string;
    src: string;
    href: string;
    media: ParseLinkMedia;
    stream_icon: string;
    error_maps: ParseLinkErrorMaps;
};

export const parseLinkFactory = apiFactory<ParseLinkResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.file[0]}/api/message/parselink`);

    /**
     * Parse link
     *
     * @param link link to parse
     *
     * @throws ZaloApiError
     *
     */
    return async function parseLink(link: string) {
        const params = {
            link: link,
            version: 1, // version 0 is not available errorMaps || version 1 is errorMaps (for response)
            imei: ctx.imei,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
