import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory, encodeAES, makeURL, request } from "../utils.js";

type Message =
    | {
          text: string;
      }
    | string;

export type ChangeNickNameResponse = "";

export const changeNickNameFactory = apiFactory<ChangeNickNameResponse>()((api, ctx, resolve) => {
    const serviceURL = makeURL(`${api.zpwServiceMap.alias[0]}/api/alias/update`);

    /**
     * Change nick name a User
     *
     * @param message Nick name want change for user
     * @param userId UserId for changeNickName
     *
     * @throws ZaloApiError
     *
     */
    return async function changeNickName(message: Message, userId: string) {
        const params = {
            friendId: userId,
            alias: `${typeof message === "string" ? message : message.text}`,
            imei: ctx.imei,
        };

        const encryptedParams = encodeAES(ctx.secretKey, JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const urlWithParams = `${serviceURL}&params=${encodeURIComponent(encryptedParams)}`;

        const response = await request(urlWithParams, {
            method: "GET",
        });

        return resolve(response);
    };
});
