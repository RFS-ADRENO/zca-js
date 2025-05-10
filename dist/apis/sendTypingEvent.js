import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { ThreadType } from "../models/Enum.js";
import { apiFactory } from "../utils.js";
export const sendTypingEventFactory = apiFactory()((api, ctx, utils) => {
    const serviceURL = {
        [ThreadType.User]: utils.makeURL(`${api.zpwServiceMap.chat[0]}/api/message/typing`),
        [ThreadType.Group]: utils.makeURL(`${api.zpwServiceMap.group[0]}/api/group/typing`),
    };
    /**
     * Send typing event
     *
     * @param id The ID of the User or Group to send the typing event to
     * @param options The options to send the typing event
     *
     * @throws ZaloApiError
     */
    return async function sendTypingEvent(id, options) {
        if (!id)
            throw new ZaloApiError("Missing id");
        if (!options)
            throw new ZaloApiError("Missing options");
        if (options.type == null || options.type == undefined)
            throw new ZaloApiError("Missing options type");
        const { type } = options;
        if (type == ThreadType.User && !("destType" in options))
            throw new ZaloApiError("Missing destType for User thread");
        let destType = "destType" in options ? options.destType : undefined;
        const params = Object.assign(Object.assign({ [type === ThreadType.User ? "toid" : "grid"]: id }, (type === ThreadType.User ? { destType } : {})), { imei: ctx.imei });
        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams)
            throw new ZaloApiError("Failed to encrypt params");
        const response = await utils.request(serviceURL[type].toString(), {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });
        return utils.resolve(response);
    };
});
