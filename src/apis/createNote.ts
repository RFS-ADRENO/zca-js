import { ZaloApiError } from "../Errors/ZaloApiError.js";
import type { NoteDetail } from "../models/index.js";
import { apiFactory } from "../utils.js";

export type CreateNoteOptions = {
    title: string;
    pinAct?: boolean;
};

export type CreateNoteResponse = NoteDetail;

export const createNoteFactory = apiFactory<CreateNoteResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.group_board[0]}/api/board/topic/createv2`);

    /**
     * Create a note in a group
     *
     * @param options note options
     * @param options.title note title
     * @param options.pinAct pin action (pin note)
     * @param groupId group id
     *
     * @throws ZaloApiError
     */
    return async function createNote(options: CreateNoteOptions, groupId: string) {
        const params = {
            grid: groupId,
            type: 0,
            color: -16777216,
            emoji: "",
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

        return utils.resolve(response, (result) => {
            if (typeof (result.data as { params: unknown }).params === "string") {
                (result.data as CreateNoteResponse).params = JSON.parse(
                    (result.data as { params: string }).params,
                );
            }

            return result.data as CreateNoteResponse;
        });
    };
});
