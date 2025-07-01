import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory, hexToNegativeColor } from "../utils.js";
export const editNoteGroupFactory = apiFactory()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.group_board[0]}/api/board/topic/updatev2`);
    /**
     * Edit an existing note in a group
     *
     * @param options.title note title
     * @param options.topicId Topic ID to edit note from
     * @param options.color note color
     * @param options.emoji note emoji
     * @param options.pinAct pin action (pin note)
     * @param groupId Group ID to create note from
     *
     * @throws ZaloApiError
     */
    return async function editNoteGroup(options, groupId) {
        var _a;
        const params = {
            grid: groupId,
            type: 0,
            color: options.color && options.color.trim() ? hexToNegativeColor(options.color) : -16777216,
            emoji: (_a = options.emoji) !== null && _a !== void 0 ? _a : "",
            startTime: -1,
            duration: -1,
            params: JSON.stringify({
                title: options.title,
            }),
            topicId: options.topicId,
            repeat: 0,
            imei: ctx.imei,
            pinAct: options.pinAct ? 1 : 2,
        };
        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams)
            throw new ZaloApiError("Failed to encrypt params");
        const response = await utils.request(serviceURL, {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });
        return utils.resolve(response);
    };
});
