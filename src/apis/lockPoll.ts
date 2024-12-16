import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type LockPollResponse = "";

export const lockPollFactory = apiFactory<LockPollResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.group[0]}/api/poll/end`);

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
