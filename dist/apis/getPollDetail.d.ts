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
export declare const getPollDetailFactory: (ctx: import("../context.js").ContextBase, api: import("../zalo.js").API) => (pollId: string) => Promise<PollDetailResponse>;
