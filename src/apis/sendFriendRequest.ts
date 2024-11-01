import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory, encodeAES, makeURL, request } from "../utils.js";

type Message = {
    text: string;
} | string;

export type SendFriendRequestResponse = ""; // add response after

export const sendFriendRequestFactory = apiFactory<SendFriendRequestResponse>()((api, ctx, resolve) => {
    const serviceURL = makeURL(`${api.zpwServiceMap.friend[0]}/api/friend/sendreq`);

    return async function sendFriendRequest(msg: Message, userId: string) {
        const params: any = {
            toid: userId,
			msg: typeof msg == "string" ? msg : msg.text,
			reqsrc: 30,
			imei: ctx.imei,
			language: ctx.language,
			srcParams: JSON.stringify({
				uidTo: userId
			})
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
