import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory, encodeAES, makeURL, request } from "../utils.js";

export type GetQRResponse = {
    data: Record<string, string>;
};

export const getQRFactory = apiFactory<GetQRResponse>()((api, ctx, resolve) => {
    const serviceURL = makeURL(`${api.zpwServiceMap.friend[0]}/api/friend/mget-qr`);

    return async function getQR(userId: string | string[]) {
        if (typeof userId == "string") userId = [userId];
        
        const params: any = {
            fids: userId
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
