import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory, encodeAES, makeURL, request } from "../utils.js";

export type FindUserResponse = {
    avatar: string;
    cover: string;
    status: string;
    gender: number;
    dob: number;
    sdob: string;
    globalId: string;
    uid: string;
    zalo_name: string;
    display_name: string;
};

export const findUserFactory = apiFactory<FindUserResponse>()((api, ctx, resolve) => {
    const serviceURL = makeURL(`${api.zpwServiceMap.friend[0]}/api/friend/profile/get`);

    /**
     * Find user by phone number
     *
     * @param phoneNumber Phone number
     *
     * @throws ZaloApiError
     */
    return async function findUser(phoneNumber: string) {
        if (!phoneNumber) throw new ZaloApiError("Missing phoneNumber");
        if (phoneNumber.startsWith("0")) {
            if (ctx.language == "vi") phoneNumber = "84" + phoneNumber.slice(1);
        }

        const params = {
            phone: phoneNumber,
            avatar_size: 240,
            language: ctx.language,
            imei: ctx.imei,
            reqSrc: 40,
        };

        const encryptedParams = encodeAES(ctx.secretKey, JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt message");

        const finalServiceUrl = new URL(serviceURL);
        finalServiceUrl.searchParams.append("params", encryptedParams);

        const response = await request(
            makeURL(finalServiceUrl.toString(), {
                params: encryptedParams,
            }),
        );

        return resolve(response, (result) => {
            if (result.error && result.error.code != 216)
                throw new ZaloApiError(result.error.message, result.error.code);

            return result.data as FindUserResponse;
        });
    };
});
