import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

type parseLinkMedia = {
    type: number;
    count: number;
    mediaTitle: string;
    artist: string;
    streamUrl: string;
    stream_icon: string;
};

type errorMaps = {
    [key: string]: number; // or Record<string, number>;
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

        const urlWithParams = `${serviceURL}&params=${encodeURIComponent(encryptedParams)}`;

        const response = await utils.request(urlWithParams, {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
