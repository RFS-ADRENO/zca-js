export declare enum BoardType {
    Note = 1,
    PinnedMessage = 2,
    Poll = 3
}
export type PollDetail = {
    creator: string;
    question: string;
    options: PollOptions[];
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
    num_vote: number;
};
export type PollOptions = {
    content: string;
    votes: number;
    voted: boolean;
    voters: string[];
    option_id: number;
};
export type NoteDetail = {
    id: string;
    type: number;
    color: number;
    emoji: string;
    startTime: number;
    duration: number;
    params: {
        title: string;
        extra?: string;
    };
    creatorId: string;
    editorId: string;
    createTime: number;
    editTime: number;
    repeat: number;
};
export type PinnedMessageDetail = {
    id: string;
    type: number;
    color: number;
    emoji: string;
    startTime: number;
    duration: number;
    params: Record<string, unknown>;
    creatorId: string;
    editorId: string;
    createTime: number;
    editTime: number;
    repeat: number;
};
