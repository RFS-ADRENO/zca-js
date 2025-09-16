import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type AddNewOptionPollPayload = {
    pollId: number;
    options: {
        voted: boolean;
        content: string;
    }[];
};

export type AddNewOptionPollResponse = {
    options: { content: string; votes: number; voted: boolean; voters: string[]; option_id: number }[];
};

export const addNewOptionPollFactory = apiFactory<AddNewOptionPollResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.group[0]}/api/poll/option/add`);

    /**
     * Add new option to poll
     *
     * @param payload 
     *
     * @throws {ZaloApiError}
     */
    return async function addNewOptionPoll(payload: AddNewOptionPollPayload) {
        let votedOptionIds: number[] = [];
        const pollDetail = await api.getPollDetail(payload.pollId);
        votedOptionIds = pollDetail.options
            .filter(option => option.votes > 0 && option.voted)
            .map(option => option.option_id);

        const params = {
            poll_id: payload.pollId,
            new_options: JSON.stringify(payload.options),
            voted_option_ids: votedOptionIds,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
