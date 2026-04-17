import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type ScanURLResponse = {
    isSafe: boolean;
};

export const scanURLFactory = apiFactory<ScanURLResponse>()((api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.file[0]}/api/message/scanurl`);

    /**
     * Scan URL
     * 
     * @param url URL to scan check if it is safe (https)
     *
     * @throws {ZaloApiError}
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
