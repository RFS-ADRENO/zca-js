import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils/index.js";

import type { LabelData } from "../../models/index.js";

export type UpdateLabelsPayload = {
    labelData: LabelData[];
    version: number;
};

export type UpdateLabelsResponse = {
    labelData: LabelData[];
    version: number;
    lastUpdateTime: number;
};

export const updateLabelsFactory = apiFactory<UpdateLabelsResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.label[0]}/api/convlabel/update`);

    /**
     * Update labels
     *
     * @param label label data
     *
     * @throws {ZaloApiError}
     */
    return async function updateLabels(payload: UpdateLabelsPayload) {
        const params = {
            labelData: JSON.stringify(payload.labelData),
            version: payload.version,
            imei: ctx.imei,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt message");

        const response = await utils.request(serviceURL, {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });

        const unFormatted = (await utils.resolve(response)) as unknown as Omit<UpdateLabelsResponse, "labelData"> & {
            labelData: string;
        };

        return {
            labelData: JSON.parse(unFormatted.labelData),
            version: unFormatted.version,
            lastUpdateTime: unFormatted.lastUpdateTime,
        };
    };
});
