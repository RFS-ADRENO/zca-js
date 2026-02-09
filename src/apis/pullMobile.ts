import { apiFactory } from "../utils.js";
import { ZaloApiError } from "../Errors/ZaloApiError.js";
export type PullMobileResponse = {
    error_code: string;
    error_message: string;
    data: string;
};

export type PullMobileParams = {
    pc_name: string;
    public_key: string;
    from_seq_id: number;
    is_retry: number;
    min_seq_id: number;
    temp_key: string;
    imei: string;
};
// The response from this does not contain any meaningful fields, it returns empty encrypted data
export const pullMobileFactory = apiFactory<PullMobileResponse>()((api, ctx, utils) => {
    const baseURL = utils.makeURL(`${api.zpwServiceMap.file[0]}/api/message/pull_mobile_msg`);
    /**
     * Pull mobile messages from the server
     *
     * @param params Pull mobile message parameters
     *
     * @throws {ZaloApiError}
     */
    return async function pullMobile(params: PullMobileParams) {
        const Params = {
            pc_name: params.pc_name,
            public_key: params.public_key,
            from_seq_id: params.from_seq_id,
            is_retry: params.is_retry,
            min_seq_id: params.min_seq_id,
            temp_key: params.temp_key,
            imei: params.imei,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(Params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const serviceURL = utils.makeURL(
            baseURL,
            {
                zpw_ver: ctx.API_VERSION,
                zpw_type: ctx.API_TYPE,
                params: encryptedParams,
                nretry: 0,
            },
            false,
        );

        const response = await utils.request(serviceURL, {
            method: "GET",
        });
        return utils.resolve(response);
    };
});
