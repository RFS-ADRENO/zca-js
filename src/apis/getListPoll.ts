import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type ListPollParams = {
    page?: number;
    count?: number;
};

export type ListPollOption = {
    content: string;
    votes: number;
    voted: boolean;
    voters: string[];
    option_id: number;
};

export type PollData = {
    creator: string;
    question: string;
    options: ListPollOption[];
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

export type NoteData = {
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
    data: PollData | NoteData;
};

export type GetListPollResponse = {
    items: BoardItem[];
    count: number;
};

export const getListPollFactory = apiFactory<GetListPollResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.group_board[0]}/api/board/list`);

    /**
     * Get list poll
     *
     * @param params - The parameters for the request
     * @param groupId - The ID of the group
     *
     * @throws ZaloApiError
     *
     */
    return async function getListPoll(params: ListPollParams, groupId: string) {
        const requestParams = {
            group_id: groupId,
            board_type: 0,
            page: params.page || 1,
            count: params.count || 20,
            last_id: 0,
            last_type: 0,
            imei: ctx.imei,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(requestParams));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
