import { ZaloApiError } from "../Errors/ZaloApiError.js";
import type { PollOptions } from "../models/index.js";
import { apiFactory } from "../utils.js";

export type VotePollResponse = {
    options: PollOptions[];
};

export const votePollFactory = apiFactory<VotePollResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.group[0]}/api/poll/vote`);

    /**
     * Vote on a poll
     *
     * @param pollId The ID of the poll to vote on
     * @param optionId The ID(s) of the option to vote on
     *
     * @throws ZaloApiError
     */
    return async function votePoll(pollId: number, optionId: number | number[]) {
        if (!Array.isArray(optionId)) optionId = [optionId];

        const params = {
            poll_id: pollId,
            option_ids: optionId, // unvote = empty array
            imei: ctx.imei,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
            method: "GET",
        });

        const result = await utils.resolve(response);
        if (api.listener) {
            api.listener.emit("poll_update", {
                groupId: String(ctx.uid),
                lastMsgId: String(Date.now()),
                pollId: pollId,
                selfAction: true,
                action: optionId.length > 0 ? "vote_or_update" : "unvote",
            });
        }

        return result;
    };
});
