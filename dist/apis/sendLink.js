import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { ThreadType } from "../models/index.js";
import { apiFactory } from "../utils.js";
export const sendLinkFactory = apiFactory()((api, ctx, utils) => {
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
    return async function sendLink(params, threadId, type = ThreadType.User) {
        var _a;
        const res = await api.parseLink(params.link);
        const requestParams = {
            href: res.data.href,
            src: res.data.src,
            title: res.data.title,
            desc: res.data.desc,
            thumb: res.data.thumb,
            type: 0,
            media: JSON.stringify(res.data.media),
            ttl: (_a = params.ttl) !== null && _a !== void 0 ? _a : 0,
            clientId: Date.now(),
        };
        if (type == ThreadType.Group) {
            requestParams.grid = threadId;
            requestParams.imei = ctx.imei;
        }
        else {
            requestParams.toId = threadId;
            requestParams.mentionInfo = "";
        }
        const encryptedParams = utils.encodeAES(JSON.stringify(requestParams));
        if (!encryptedParams)
            throw new ZaloApiError("Failed to encrypt params");
        const response = await utils.request(serviceURL[type], {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });
        return utils.resolve(response);
    };
});
