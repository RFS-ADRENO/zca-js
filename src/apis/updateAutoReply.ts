import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

import type { AutoReplyItem, AutoReplyScope } from "../models/index.js";

export type UpdateAutoReplyPayload = {
    id: number;
    content: string;
    isEnable: boolean;
    startTime: number;
    endTime: number;
    scope: AutoReplyScope;
    uids?: string | string[];
};

export type UpdateAutoReplyResponse = {
    item: AutoReplyItem;
    version: number;
};

export const updateAutoReplyFactory = apiFactory<UpdateAutoReplyResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.auto_reply[0]}/api/autoreply/update`);

    /**
     * Update auto reply
     *
     * @param payload payload
     *
     * @note this API used for zBusiness
     * @throws ZaloApiError
     */
    return async function updateAutoReply(payload: UpdateAutoReplyPayload) {
        const uids = Array.isArray(payload.uids) ? payload.uids : [payload.uids];
        const resultUids = payload.scope === 2 || payload.scope === 3 ? uids : [];

        const params = {
            cliLang: ctx.language,
            id: payload.id,
            enable: payload.isEnable,
            content: payload.content,
            startTime: payload.startTime,
            endTime: payload.endTime,
            recurrence: ["RRULE:FREQ=DAILY;"],
            scope: payload.scope,
            uids: resultUids,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(serviceURL, {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });

        return utils.resolve(response);
    };
});
