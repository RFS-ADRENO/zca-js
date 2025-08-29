import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type GetAutoReplyListResponse = {
    item: {
        id: number;
        weight: number;
        enable: boolean;
        modifiedTime: number;
        startTime: number;
        endTime: number;
        content: string;
        scope: number;
        uids: string[] | null; // isNull means don't choose users
        ownerId: number;
        recurrence: string[];
        createdTime: number;
    }[];
    version: number;
};
export const getAutoReplyListFactory = apiFactory<GetAutoReplyListResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.auto_reply[0]}/api/autoreply/list`);

    /**
     * Get auto reply list
     *
     * @note this API used for zBusiness
     * @throws ZaloApiError
     */
    return async function getAutoReplyList() {
        const params = {
            version: 0,
            cliLang: ctx.language,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
