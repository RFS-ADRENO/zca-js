import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils/index.js";

export type UnBlockUserResponse = "";

export const unblockUserFactory = apiFactory<UnBlockUserResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.friend[0]}/api/friend/unblock`);

    /**
     * Unblock a User
     *
     * @param userId The ID of the User to unblock
     *
     * @throws {ZaloApiError}
     */
    return async function unblockUser(userId: string) {
        const params = {
            fid: userId,
            imei: ctx.imei,
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
