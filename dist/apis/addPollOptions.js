import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";
export const addPollOptionsFactory = apiFactory()((api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.group[0]}/api/poll/option/add`);
    /**
     * Add new option to poll
     *
     * @param payload
     *
     * @throws {ZaloApiError}
     */
    return async function addPollOptions(payload) {
        const params = {
            poll_id: payload.pollId,
            new_options: JSON.stringify(payload.options),
            voted_option_ids: payload.votedOptionIds,
        };
        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams)
            throw new ZaloApiError("Failed to encrypt params");
        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
            method: "GET",
        });
        return utils.resolve(response);
    };
});
