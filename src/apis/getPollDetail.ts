import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type PollOption = {
    content: string;
    votes: number;
    voted: boolean;
    voters: string[];
    option_id: number;
};

export type PollDetailResponse = {
    creator: string;
    question: string;
    options: PollOption[];
    joined: boolean;
    closed: boolean;
    poll_id: number;
    allow_multi_choices: boolean;
    allow_add_new_option: boolean;
    is_anonymous: boolean;
    poll_type: number;
    created_time: number;
    updated_time: number;
    expired_time: number;
    is_hide_vote_preview: boolean;
    num_vote: boolean;
};

export const getPollDetailFactory = apiFactory<PollDetailResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.group[0]}/api/poll/detail`);

    /**
     * Get poll detail
     *
     * @param pollId Poll ID
     *
     * @throws ZaloApiError
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
