import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type CreateNoteResponse = {
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

export const createNoteFactory = apiFactory<CreateNoteResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.group_board[0]}/api/board/topic/createv2`);

    /**
     * Create a note in a group
     *
     * @param groupId Group ID to create note from
     * @param title note title
     * @param pinAct Pin action (pin note)
     *
     * @throws ZaloApiError
     */
    return async function createNote(groupId: string, title: string, pinAct?: boolean) {
        const params = {
            grid: groupId,
            type: 0,
            color: -16777216,
            emoji: "",
            startTime: -1,
            duration: -1,
            params: JSON.stringify({
                title: title,
            }),
            repeat: 0,
            src: 1,
            imei: ctx.imei,
            pinAct: pinAct ? 1 : 0,
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
