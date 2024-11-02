import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory, encodeAES, makeURL, request } from "../utils.js";

type Message =
    | {
          text: string;
      }
    | string;

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

export const createNoteFactory = apiFactory<CreateNoteResponse>()((api, ctx, resolve) => {
    const serviceURL = makeURL(`${api.zpwServiceMap.group_board[0]}/api/board/topic/createv2`);

    /**
     * @msg (string): Message for note
     * @groupId (string): Group ID to create note from
     * @pinAct (number): Pin action (pin note) || 0 = false, 1 = true
     */
    return async function createNote(msg: Message, groupId: string) {
        const params: any = {
            grid: groupId,
            type: 0,
            color: -16777216,
            emoji: "",
            startTime: -1,
            duration: -1,
            params: {
                title: `${typeof msg === "string" ? msg : msg.text}`,
            },
            repeat: 0,
            src: 1,
            imei: ctx.imei,
            pinAct: 0,
        };

        params.params = JSON.stringify(params.params);

        const encryptedParams = encodeAES(ctx.secretKey, JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await request(serviceURL, {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });

        return resolve(response);
    };
});
