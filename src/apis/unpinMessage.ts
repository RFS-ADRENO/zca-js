import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type UnpinMessageResponse = "" | number;

export const unpinMessageFactory = apiFactory<UnpinMessageResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.group_board[0]}/api/board/topic/remove`);

    /**
     * Bỏ ghim tin nhắn trong nhóm
     *
     * @param pinId ID của pin (trả về từ pinMessage hoặc getListBoard)
     * @param groupId ID nhóm
     *
     * @throws {ZaloApiError}
     *
     * @example
     * // Bỏ ghim tin nhắn
     * await api.unpinMessage("875987868", "8330281778886679712");
     */
    return async function unpinMessage(pinId: string, groupId: string): Promise<UnpinMessageResponse> {
        const params = {
            grid: groupId,
            topicId: pinId,
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
