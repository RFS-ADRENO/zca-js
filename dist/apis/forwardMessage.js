import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { ThreadType } from "../models/Enum.js";
import { apiFactory } from "../utils.js";
export const forwardMessageFactory = apiFactory()((api, ctx, utils) => {
    const serviceURL = {
        [ThreadType.User]: utils.makeURL(`${api.zpwServiceMap.file[0]}/api/message/mforward`),
        [ThreadType.Group]: utils.makeURL(`${api.zpwServiceMap.file[0]}/api/group/mforward`),
    };
    /**
     * Forward message to multiple threads
     * @notes chưa hoàn thiện phần chuyển tiếp ảnh chỉ có thể sử dụng chuyển tiếp tin nhắn không có hình ảnh
     *
     * @param params Forward message parameters
     * @param type Thread type (User/Group)
     *
     * @throws ZaloApiError
     */
    return async function forwardMessage(params, type = ThreadType.User) {
        var _a, _b;
        if (!params.message)
            throw new ZaloApiError("Missing message content");
        if (!params.threadIds || params.threadIds.length === 0)
            throw new ZaloApiError("Missing thread IDs");
        const timestamp = Date.now();
        const clientId = timestamp.toString();
        const msgInfo = {
            message: params.message,
            reference: params.reference
                ? JSON.stringify({
                    type: 3,
                    data: JSON.stringify(params.reference),
                })
                : undefined,
        };
        const decorLog = params.reference
            ? {
                fw: {
                    pmsg: {
                        st: 1,
                        ts: params.reference.ts,
                        id: params.reference.id,
                    },
                    rmsg: {
                        st: 1,
                        ts: params.reference.ts,
                        id: params.reference.id,
                    },
                    fwLvl: params.reference.fwLvl,
                },
            }
            : null;
        let requestParams;
        if (type === ThreadType.User) {
            // Structure for User type
            requestParams = {
                toIds: params.threadIds.map((threadId) => {
                    var _a;
                    return ({
                        clientId,
                        toUid: threadId,
                        ttl: (_a = params.ttl) !== null && _a !== void 0 ? _a : 0,
                    });
                }),
                imei: ctx.imei,
                ttl: (_a = params.ttl) !== null && _a !== void 0 ? _a : 0,
                msgType: "1",
                totalIds: params.threadIds.length,
                msgInfo: JSON.stringify(msgInfo),
                decorLog: JSON.stringify(decorLog),
            };
        }
        else {
            // Structure for Group type
            requestParams = {
                grids: params.threadIds.map((threadId) => {
                    var _a;
                    return ({
                        clientId,
                        grid: threadId,
                        ttl: (_a = params.ttl) !== null && _a !== void 0 ? _a : 0,
                    });
                }),
                ttl: (_b = params.ttl) !== null && _b !== void 0 ? _b : 0,
                msgType: "1",
                totalIds: params.threadIds.length,
                msgInfo: JSON.stringify(msgInfo),
                decorLog: JSON.stringify(decorLog),
            };
        }
        const encryptedParams = utils.encodeAES(JSON.stringify(requestParams));
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
