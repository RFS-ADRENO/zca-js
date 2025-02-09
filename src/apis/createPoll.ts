import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

/**
 * Options for creating a poll.
 */
export type CreatePollOptions = {
    /**
     * Question for the poll.
     */
    question: string;

    /**
     * List of options for the poll.
     */
    options: string[];

    /**
     * Poll expiration time in milliseconds (0 = no expiration).
     */
    expiredTime?: number;

    /**
     * Pin action to pin the poll.
     */
    pinAct?: boolean;

    /**
     * Allows multiple choices in the poll.
     */
    allowMultiChoices?: boolean;

    /**
     * Allows members to add new options to the poll.
     */
    allowAddNewOption?: boolean;

    /**
     * Hides voting results until the user has voted.
     */
    hideVotePreview?: boolean;

    /**
     * Hides poll voters (anonymous poll).
     */
    isAnonymous?: boolean;
};

export type CreatePollResponse = {
    creator: string;
    question: string;
    options: string[];
    joined: boolean;
    closed: boolean;
    poll_id: string;
    allow_multi_choices: boolean;
    allow_add_new_option: boolean;
    is_anonymous: boolean;
    poll_type: number;
    created_time: number;
    updated_time: number;
    expiried_time: number;
    is_hide_vote_preview: boolean;
    num_vote: number;
};

export const createPollFactory = apiFactory<CreatePollResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.group[0]}/api/poll/create`);

    /**
     * Create a poll in a group.
     *
     * @param options Poll options
     * @param groupId Group ID to create poll from
     *
     * @throws ZaloApiError
     */
    return async function createPoll(options: CreatePollOptions, groupId: string) {
        const params = {
            group_id: groupId,
            question: options.question,
            options: options.options,
            expired_time: options.expiredTime ?? 0,
            pinAct: !!options.pinAct,
            allow_multi_choices: !!options.allowMultiChoices,
            allow_add_new_option: !!options.allowAddNewOption,
            is_hide_vote_preview: !!options.hideVotePreview,
            is_anonymous: !!options.isAnonymous,
            poll_type: 0,
            src: 1,
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
