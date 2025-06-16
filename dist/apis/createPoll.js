import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";
export const createPollFactory = apiFactory()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.group[0]}/api/poll/create`);
    /**
     * Create a poll in a group.
     *
     * @param options Poll options
     * @param groupId Group ID to create poll from
     *
     * @throws ZaloApiError
     */
    return async function createPoll(options, groupId) {
        var _a;
        const params = {
            group_id: groupId,
            question: options.question,
            options: options.options,
            expired_time: (_a = options.expiredTime) !== null && _a !== void 0 ? _a : 0,
            pinAct: !!options.pinAct,
            allow_multi_choices: !!options.allowMultiChoices,
            allow_add_new_option: !!options.allowAddNewOption,
            is_hide_vote_preview: !!options.hideVotePreview,
            is_anonymous: !!options.isAnonymous,
            poll_type: 0,
            src: 1,
            imei: ctx.imei,
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
