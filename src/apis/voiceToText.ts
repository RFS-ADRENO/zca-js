import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type VoiceToTextResponse = {
    req_id: string;
};

export const voiceToTextFactory = apiFactory<VoiceToTextResponse>()((api, _, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.ai_features[0]}/api/aifeatures/voice2text`);

    /**
     * Voice to text
     *
     * @param voiceURL voice URL
     *
     * @throws {ZaloApiError}
     */
    return async function voiceToText(voiceURL: string) {
        const params = {
            url: voiceURL,
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
