import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory, encodeAES, makeURL, request } from "../utils.js";

export type GetQRResponse = {
    data: Record<string, string>;
};

export const getQRFactory = apiFactory<GetQRResponse>()((api, ctx, resolve) => {
    const serviceURL = makeURL(`${api.zpwServiceMap.friend[0]}/api/friend/mget-qr`);

    /**
     * Get QR code for users
     *
     * @param userId User ID or list of user IDs (string[]). If userId is a string, it will be wrapped in an array.
     *
     * @throws ZaloApiError
     */
    return async function getQR(userId: string | string[]) {
        if (typeof userId == "string") userId = [userId];

        const params = {
            fids: userId,
        };

        const encryptedParams = encodeAES(ctx.secretKey, JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await request(serviceURL, {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });

        return resolve(response);
    };
});
