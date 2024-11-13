import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory, encodeAES, makeURL, request } from "../utils.js";

type Message =
    | {
          text: string;
      }
    | string;

export type EditNoteResponse = {
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

export const editNoteFactory = apiFactory<EditNoteResponse>()((api, ctx, resolve) => {
    const serviceURL = makeURL(`${api.zpwServiceMap.group_board[0]}/api/board/topic/updatev2`);

    /**
     * @msg (string): Message for edit note
     * @groupId (string): Group ID to create note from
     * @pinAct (number): Pin action (pin note) || 0 = false, 1 = true, (2 = edit note)
     */
    return async function editNote(msg: Message, topicId: string, groupId: string) {
        const params: any = {
            grid: groupId,
            type: 0,
            color: -16777216,
            emoji: "",
            startTime: -1,
            duration: -1,
            params: {
                title: `${typeof msg == "string"? msg : msg.text}`,
                extra: "",
            },
            topicId: topicId,
            repeat: 0,
            imei: ctx.imei,
            pinAct: 2,
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
