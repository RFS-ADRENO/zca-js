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

    /**
     * @question (string): Question for poll
     * @options (string[]): List options for poll
     * @groupId (string): Group ID to create poll from
     * @expiredTime (number): Poll expiration time (0 = no expiration)
     * @pinAct (boolean): Pin action (pin poll)
     * @multiChoices (boolean): Allows multiple poll choices
     * @allowAddNewOption (boolean): Allow members to add new options
     * @hideVotePreview (boolean): Hide voting results when haven't voted
     * @isAnonymous (boolean): Hide poll voters
     */
    return async function createPoll(
        question: Message,
        options: string[],
        groupId: string,
        expiredTime = 0,
        pinAct = false,
        allowMultiChoices = false,
        allowAddNewOption = false,
        hideVotePreview = false,
        isAnonymous = false,
    ) {
        const params: any = {
            group_id: groupId,
            question: typeof question == "string" ? question : question.text,
            options: [],
            expired_time: expiredTime,
            pinAct: pinAct,
            allow_multi_choices: allowMultiChoices,
            allow_add_new_option: allowAddNewOption,
            is_hide_vote_preview: hideVotePreview,
            is_anonymous: isAnonymous,
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
