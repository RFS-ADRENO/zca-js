import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { ThreadType } from "../models/Enum.js";
import { apiFactory } from "../utils.js";

export type SendLinkParams = {
    link: string;
    ttl?: number;
};

export type SendLinkResponse = {
    msgId: string;
};

export const sendLinkFactory = apiFactory<SendLinkResponse>()((api, ctx, utils) => {
    const serviceURL = {
        [ThreadType.User]: utils.makeURL(`${api.zpwServiceMap.chat[0]}/api/message/link`, {
            nretry: 0,
        }),
        [ThreadType.Group]: utils.makeURL(`${api.zpwServiceMap.group[0]}/api/group/sendlink`, {
            nretry: 0,
        }),
    };

    /**
     * Send link
     *
     * @param params Link and ttl parameters
     * @param threadId Thread ID
     * @param type Thread type
     *
     * @throws ZaloApiError
     */
    return async function sendLink(params: SendLinkParams, threadId: string, type: ThreadType = ThreadType.User) {
        const res = await api.parseLink(params.link);

        const requestParams: any = {
            href: res.data.href,
            src: res.data.src,
            title: res.data.title,
            desc: res.data.desc,
            thumb: res.data.thumb,
            type: 0,
            media: JSON.stringify(res.data.media),
            ttl: params.ttl ?? 0,
            clientId: Date.now(),
        };

        if (type == ThreadType.Group) {
            requestParams.grid = threadId;
            requestParams.imei = ctx.imei;
        } else {
            requestParams.toId = threadId;
            requestParams.mentionInfo = "";
        }

        const encryptedParams = utils.encodeAES(JSON.stringify(requestParams));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(serviceURL[type].toString(), {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });

        return utils.resolve(response);
    };
});
