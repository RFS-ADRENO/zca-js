import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory, hexToNegativeColor } from "../utils.js";

export type EditNoteGroupOptions = {
    title: string;
    topicId: string;
    color?: string;
    emoji?: string;
    pinAct?: boolean;
};

export type EditNoteGroupResponse = {
    id: string;
    type: number;
    color: number;
    emoji: string;
    startTime: number;
    duration: number;
    params: {
        title: string;
        extra: string;
    };
    creatorId: string;
    editorId: string;
    createTime: number;
    editTime: number;
    repeat: number;
};

export const editNoteGroupFactory = apiFactory<EditNoteGroupResponse>()((api, ctx, utils) => {
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
    return async function editNoteGroup(options: EditNoteGroupOptions, groupId: string) {
        const params = {
            grid: groupId,
            type: 0,
            color: options.color && options.color.trim() ? hexToNegativeColor(options.color) : -16777216,
            emoji: options.emoji ?? "",
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
