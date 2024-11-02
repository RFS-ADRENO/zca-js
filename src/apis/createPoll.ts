import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory, encodeAES, makeURL, request } from "../utils.js";

type Message =
    | {
          text: string;
      }
    | string;

export type CreatePollResponse = {
    creator: string;
    question: string;
    options: string[];
    joined: boolean;
    closed: boolean;
    poll_id: string;
    allow_multi_choices: boolean;
    allow_add_new_option: boolean;
    is_anonymous: boolean;
    poll_type: number;
    created_time: number;
    updated_time: number;
    expiried_time: number;
    is_hide_vote_preview: boolean;
    num_vote: number;
};

export const createPollFactory = apiFactory<CreatePollResponse>()((api, ctx, resolve) => {
    const serviceURL = makeURL(`${api.zpwServiceMap.group[0]}/api/poll/create`);

    return async function createPoll(question: Message, options: string | string[], groupId: string) {
        const params: any = {
            group_id: groupId,
			question: typeof question == "string" ? question : question.text,
			options: [],
			expired_time: 0,
			pinAct: false,
			allow_multi_choices: true,
			allow_add_new_option: true,
			is_hide_vote_preview: false,
			is_anonymous: false,
			poll_type: 0,
			src: 1,
			imei: ctx.imei,
        };

        if (Array.isArray(options)) {
            params.options = options;
        } else {
            params.options = params.options || [];
            params.options.push(String(options));
        }

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
