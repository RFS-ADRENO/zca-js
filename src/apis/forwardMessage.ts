import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { ThreadType } from "../models/index.js";
import { apiFactory } from "../utils.js";

export type ForwardMessagePayload = {
    message: string;
    ttl?: number;
    reference?: {
        id: string;
        ts: number;
        logSrcType: number;
        fwLvl: number;
    };
};

export type ForwardMessageSuccess = {
    clientId: string;
    msgId: string;
};

export type ForwardMessageFail = {
    clientId: string;
    error_code: string;
};

export type ForwardMessageResponse = {
    success: ForwardMessageSuccess[];
    fail: ForwardMessageFail[];
};

export const forwardMessageFactory = apiFactory<ForwardMessageResponse>()((api, ctx, utils) => {
    const serviceURL = {
        [ThreadType.User]: utils.makeURL(`${api.zpwServiceMap.file[0]}/api/message/mforward`),
        [ThreadType.Group]: utils.makeURL(`${api.zpwServiceMap.file[0]}/api/group/mforward`),
    };

    /**
     * Forward message to multiple threads
     *
     * @param payload Forward message payload
     * @param threadId Thread ID(s)
     * @param type Thread type (User/Group)
     *
     * @throws {ZaloApiError}
     */
    return async function forwardMessage(
        payload: ForwardMessagePayload,
        threadIds: string[],
        type: ThreadType = ThreadType.User,
    ) {
        if (!payload.message) throw new ZaloApiError("Missing message content");
        if (!threadIds || threadIds.length === 0) throw new ZaloApiError("Missing thread IDs");

        const timestamp = Date.now();
        const clientId = timestamp.toString();

        const msgInfo = {
            message: payload.message,
            reference: payload.reference
                ? JSON.stringify({
                      type: 3,
                      data: JSON.stringify(payload.reference),
                  })
                : undefined,
        };

        const decorLog = payload.reference
            ? {
                  fw: {
                      pmsg: {
                          st: 1,
                          ts: payload.reference.ts,
                          id: payload.reference.id,
                      },
                      rmsg: {
                          st: 1,
                          ts: payload.reference.ts,
                          id: payload.reference.id,
                      },
                      fwLvl: payload.reference.fwLvl,
                  },
              }
            : null;

        let params;
        if (type === ThreadType.User) {
            params = {
                toIds: threadIds.map((threadId) => ({
                    clientId,
                    toUid: threadId,
                    ttl: payload.ttl ?? 0,
                })),
                imei: ctx.imei,
                ttl: payload.ttl ?? 0,
                msgType: "1",
                totalIds: threadIds.length,
                msgInfo: JSON.stringify(msgInfo),
                decorLog: JSON.stringify(decorLog),
            };
        } else {
            params = {
                grids: threadIds.map((threadId) => ({
                    clientId,
                    grid: threadId,
                    ttl: payload.ttl ?? 0,
                })),
                ttl: payload.ttl ?? 0,
                msgType: "1",
                totalIds: threadIds.length,
                msgInfo: JSON.stringify(msgInfo),
                decorLog: JSON.stringify(decorLog),
            };
        }

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(serviceURL[type], {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });

        return utils.resolve(response);
    };
});
