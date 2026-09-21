import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";
export const getLabelsFactory = apiFactory()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.label[0]}/api/convlabel/get`);
    /**
     * Get all labels
     *
     * @throws {ZaloApiError}
     */
    return async function getLabels() {
        const params = {
            imei: ctx.imei,
        };
        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams)
            throw new ZaloApiError("Failed to encrypt message");
        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }));
        return utils.resolve(response, (result) => {
            const data = result.data;
            const formattedData = {
                labelData: JSON.parse(data.labelData),
                version: data.version,
                lastUpdateTime: data.lastUpdateTime,
            };
            return formattedData;
        });
    };
});
