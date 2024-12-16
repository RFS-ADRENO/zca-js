import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

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

export const createPollFactory = apiFactory<CreatePollResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.group[0]}/api/poll/create`);

    /**
     * Create a poll in a group.
     *
     * @param question Question for poll
     * @param options List options for poll
     * @param groupId Group ID to create poll from
     * @param expiredTime Poll expiration time (0 = no expiration), timestamp is in milliseconds
     * @param pinAct Pin action (pin poll)
     * @param multiChoices Allows multiple poll choices
     * @param allowAddNewOption Allow members to add new options
     * @param hideVotePreview Hide voting results when haven't voted
     * @param isAnonymous Hide poll voters
     *
     * @throws ZaloApiError
     */
    return async function createPoll(
        question: Message,
        options: string[],
        groupId: string,
        expiredTime: number = 0,
        pinAct: boolean = false,
        allowMultiChoices: boolean = false,
        allowAddNewOption: boolean = false,
        hideVotePreview: boolean = false,
        isAnonymous: boolean = false,
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
