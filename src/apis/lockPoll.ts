import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory, encodeAES, makeURL, request } from "../utils.js";

export type LockPollResponse = "";

export const lockPollFactory = apiFactory<LockPollResponse>()((api, ctx, resolve) => {
    const serviceURL = makeURL(`${api.zpwServiceMap.group[0]}/api/poll/end`);

    /**
     * Lock a poll, preventing further votes.
     * 
     * @param pollId Poll id to lock
     * 
     * @throws ZaloApiError
     */
    return async function lockPoll(pollId: number) {
        const params = {
            poll_id: pollId,
            imei: ctx.imei,
        };

        const encryptedParams = encodeAES(ctx.secretKey, JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await request(serviceURL, {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });

        return resolve(response);
    };
});
