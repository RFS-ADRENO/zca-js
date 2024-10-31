import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory, encodeAES, makeURL, request } from "../utils.js";

export type AcceptFriendRequestResponse = "";

export const acceptFriendRequestFactory = apiFactory<AcceptFriendRequestResponse>()((api, ctx, resolve) => {
    const serviceURL = makeURL(`${api.zpwServiceMap.friend[0]}/api/friend/accept`);

    return async function acceptFriendRequest(userId: string) {
        const params: any = {
            fid: userId,
			language: ctx.language,
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
