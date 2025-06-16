import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory, hexToNegativeColor } from "../utils.js";

export type CreateNoteGroupOptions = {
    title: string;
    color?: string;
    emoji?: string;
    pinAct?: boolean;
};

export type CreateNoteGroupResponse = {
    id: string;
    type: number;
    color: number;
    emoji: string;
    startTime: number;
    duration: number;
    params: {
        title: string;
    };
    creatorId: string;
    editorId: string;
    createTime: number;
    editTime: number;
    repeat: number;
};

export const createNoteGroupFactory = apiFactory<CreateNoteGroupResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.group_board[0]}/api/board/topic/createv2`);

    /**
     * Create a note in a group
     *
     * @param options note options
     * @param options.title note title
     * @param options.color note color
     * @param options.emoji note emoji
     * @param options.pinAct pin action (pin note)
     * @param threadId group id
     *
     * @throws ZaloApiError
     */
    return async function createNoteGroup(options: CreateNoteGroupOptions, threadId: string) {
        const params = {
            grid: threadId,
            type: 0,
            color: options.color ? hexToNegativeColor(options.color) : -16777216,
            emoji: options.emoji ?? "",
            startTime: -1,
            duration: -1,
            params: JSON.stringify({
                title: options.title,
            }),
            repeat: 0,
            src: 1,
            imei: ctx.imei,
            pinAct: options.pinAct ? 1 : 0,
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
