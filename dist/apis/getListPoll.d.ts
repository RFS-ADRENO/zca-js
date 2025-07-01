export type ListPollParams = {
    page?: number;
    count?: number;
};
export type BoardItemPollData = {
    creator: string;
    question: string;
    options: {
        content: string;
        votes: number;
        voted: boolean;
        voters: string[];
        option_id: number;
    }[];
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
export type BoardItemNoteData = {
    id: string;
    type: number;
    color: number;
    emoji: string;
    startTime: number;
    duration: number;
    params: string;
    creatorId: string;
    editorId: string;
    createTime: number;
    editTime: number;
    repeat: number;
};
export type BoardItem = {
    boardType: number;
    data: BoardItemPollData | BoardItemNoteData;
};
export type GetListPollResponse = {
    items: BoardItem[];
    count: number;
};
export declare const getListPollFactory: (ctx: import("../context.js").ContextBase, api: import("../zalo.js").API) => (params: ListPollParams, groupId: string) => Promise<GetListPollResponse>;
