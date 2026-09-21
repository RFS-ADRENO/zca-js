import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { BoardType } from "../models/index.js";
import { apiFactory } from "../utils.js";
export const getListBoardFactory = apiFactory()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.group_board[0]}/api/board/list`);
    /**
     * Get list board items in a group
     *
     * @param options - The options for the request
     * @param groupId - The ID of the group
     *
     * @throws {ZaloApiError}
     *
     */
    return async function getListBoard(options, groupId) {
        var _a, _b;
        const requestParams = {
            group_id: groupId,
            board_type: 0,
            page: (_a = options.page) !== null && _a !== void 0 ? _a : 1,
            count: (_b = options.count) !== null && _b !== void 0 ? _b : 20,
            last_id: 0,
            last_type: 0,
            imei: ctx.imei,
        };
        const encryptedParams = utils.encodeAES(JSON.stringify(requestParams));
        if (!encryptedParams)
            throw new ZaloApiError("Failed to encrypt params");
        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
            method: "GET",
        });
        return utils.resolve(response, (result) => {
            const data = result.data;
            data.items.forEach((item) => {
                if (item.boardType != BoardType.Poll) {
                    const detailData = item.data;
                    if (typeof detailData.params === "string") {
                        detailData.params = JSON.parse(detailData.params);
                    }
                }
            });
            return data;
        });
    };
});
