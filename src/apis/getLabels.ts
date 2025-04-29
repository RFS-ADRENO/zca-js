import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type GetLabelsResponse = {
    labelData: {
        id: number;
        text: string;
        textKey: string;
        conversations: string[];
        color: string;
        offset: number;
        emoji: string;
        createTime: number;
    }[];
    version: number;
    lastUpdateTime: number;
};

export const getLabelsFactory = apiFactory<GetLabelsResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.label[0]}/api/convlabel/get`);

    /**
     * Get all labels
     *
     * @throws ZaloApiError
     */
    return async function getLabels() {
        const params = {
            imei: ctx.imei,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt message");

        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }));

        const unFormatted = (await utils.resolve(response)) as unknown as Omit<GetLabelsResponse, "labelData"> & {
            labelData: string;
        };

        return {
            labelData: JSON.parse(unFormatted.labelData),
            version: unFormatted.version,
            lastUpdateTime: unFormatted.lastUpdateTime,
        };
    };
});
