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
export declare const createPollFactory: (ctx: import("../context.js").ContextBase, api: import("../zalo.js").API) => (options: CreatePollOptions, groupId: string) => Promise<CreatePollResponse>;
