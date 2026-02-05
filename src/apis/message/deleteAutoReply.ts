import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils/index.js";

export type DeleteAutoReplyResponse = {
    item: number;
    version: number;
};

export const deleteAutoReplyFactory = apiFactory<DeleteAutoReplyResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.auto_reply[0]}/api/autoreply/delete`);

    /**
     * Delete auto reply
     *
     * @param id id of auto reply
     *
     * @note this API used for zBusiness
     * @throws {ZaloApiError}
     */
    return async function deleteAutoReply(id: number) {
        const params = {
            cliLang: ctx.language,
            id: id,
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
