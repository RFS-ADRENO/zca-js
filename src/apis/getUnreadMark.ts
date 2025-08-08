import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type UnreadMark = {
    id: number;
    cliMsgId: number;
    fromUid: number;
    ts: number;
};

export type GetUnreadMarkResponse = {
    data: {
        convsGroup: UnreadMark[];
        convsUser: UnreadMark[];
    };
    status: number;
};

export const getUnreadMarkFactory = apiFactory<GetUnreadMarkResponse>()((api, _, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.conversation[0]}/api/conv/getUnreadMark`);

    /**
     * Get unread mark
     *
     * @throws ZaloApiError
     *
     */
    return async function getUnreadMark() {
        const params = {};

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
            method: "GET",
        });

        return utils.resolve(response, (result) => {
            const data = result.data as { data: unknown; status: number };
            if (typeof data.data === "string") {
                return {
                    data: JSON.parse(data.data) as GetUnreadMarkResponse["data"],
                    status: data.status,
                };
            }

            return data as GetUnreadMarkResponse;
        });
    };
});
