import type { PollDetail } from "../models/index.js";
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
export type CreatePollResponse = PollDetail;
export declare const createPollFactory: (ctx: import("../context.js").ContextBase, api: import("../apis.js").API) => (options: CreatePollOptions, groupId: string) => Promise<PollDetail>;
