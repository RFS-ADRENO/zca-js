import { ZaloApiError } from "../Errors/ZaloApiError.js";
import type { PollDetail } from "../models/index.js";
import { apiFactory } from "../utils.js";

export type PollDetailResponse = PollDetail;

export const getPollDetailFactory = apiFactory<PollDetailResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.group[0]}/api/poll/detail`);

    /**
     * Get poll detail
     *
     * @param pollId Poll ID
     *
     * @throws {ZaloApiError}
     */
    return async function getPollDetail(pollId: string) {
        if (!pollId) throw new ZaloApiError("Missing poll id");

        const params = {
            poll_id: pollId,
            imei: ctx.imei,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt message");

        const response = await utils.request(serviceURL, {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });

        return utils.resolve(response);
    };
});
