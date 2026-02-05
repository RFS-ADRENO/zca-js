import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils/index.js";

export type SharePollResponse = "";

export const sharePollFactory = apiFactory<SharePollResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.group[0]}/api/poll/share`);

    /**
     * Share a poll
     *
     * @param pollId poll id to share
     *
     * @throws {ZaloApiError}
     */
    return async function sharePoll(pollId: number) {
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
