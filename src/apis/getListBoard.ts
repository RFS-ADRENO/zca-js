import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { NoteDetail, PinnedMessageDetail, PollDetail, BoardType } from "../models/index.js";
import { apiFactory } from "../utils.js";

export type ListBoardOptions = {
    page?: number;
    count?: number;
};

export type BoardItem = {
    boardType: BoardType;
    data: PollDetail | NoteDetail | PinnedMessageDetail;
};

export type GetListBoardResponse = {
    items: BoardItem[];
    count: number;
};

type RawListBoard = {
    items: {
        boardType: BoardType;
        data: Record<string, unknown>;
    }[];
    count: number;
};

export const getListBoardFactory = apiFactory<GetListBoardResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.group_board[0]}/api/board/list`);

    /**
     * Get list board items in a group
     *
     * @param options - The options for the request
     * @param groupId - The ID of the group
     *
     * @throws ZaloApiError
     *
     */
    return async function getListBoard(options: ListBoardOptions, groupId: string) {
        const requestParams = {
            group_id: groupId,
            board_type: 0,
            page: options.page ?? 1,
            count: options.count ?? 20,
            last_id: 0,
            last_type: 0,
            imei: ctx.imei,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(requestParams));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
            method: "GET",
        });

        return utils.resolve(response, (result) => {
            const data = result.data as RawListBoard;
            data.items.forEach((item) => {
                if (item.boardType != BoardType.Poll) {
                    const detailData = item.data;
                    if (typeof detailData.params === "string") {
                        detailData.params = JSON.parse(detailData.params);
                    }
                }
            });

            return data as GetListBoardResponse;
        });
    };
});
