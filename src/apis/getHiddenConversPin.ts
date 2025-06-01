import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type ThreadInfo = {
    is_group: number;
    thread_id: string;
};

export type GetHiddenConversPinResponse = {
    pin: string;
    threads: ThreadInfo[];
};

export const getHiddenConversPinFactory = apiFactory<GetHiddenConversPinResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.conversation[0]}/api/hiddenconvers/get-all`);

    /**
     * Get hidden convers pin
     *
     * @throws ZaloApiError
     *
     */
    return async function getHiddenConversPin() {
        const params = {
            imei: ctx.imei,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
