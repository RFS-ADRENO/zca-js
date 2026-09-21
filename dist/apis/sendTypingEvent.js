import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { DestType, ThreadType } from "../models/index.js";
import { apiFactory } from "../utils.js";
export const sendTypingEventFactory = apiFactory()((api, ctx, utils) => {
    const serviceURL = {
        [ThreadType.User]: utils.makeURL(`${api.zpwServiceMap.chat[0]}/api/message/typing`),
        [ThreadType.Group]: utils.makeURL(`${api.zpwServiceMap.group[0]}/api/group/typing`),
    };
    /**
     * Send typing event
     *
     * @param threadId The ID of the User or Group to send the typing event to
     * @param type The type of thread (User or Group)
     * @param destType The destination type (User or Page), for User threads only, defaults to User
     *
     * @throws {ZaloApiError}
     */
    return async function sendTypingEvent(threadId, type = ThreadType.User, destType = DestType.User) {
        if (!threadId)
            throw new ZaloApiError("Missing threadId");
        const params = Object.assign(Object.assign({ [type === ThreadType.User ? "toid" : "grid"]: threadId }, (type === ThreadType.User ? { destType } : {})), { imei: ctx.imei });
        const encryptedParams = utils.encodeAES(JSON.stringify(params));
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
