import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type ScanURLResponse = {
    isSafe: boolean;
};

export const scanURLFactory = apiFactory<ScanURLResponse>()((api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.file[0]}/api/message/scanurl`);

    /**
     * Scan URL to check if it is safe?
     * 
     * @param url URL to scan
     *
     * @throws {ZaloApiError} When something went wrong, with `error.code`
     * - `114` - Invalid params
     */
    return async function scanURL(url: string) {

        const params = {
            url: url,
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
