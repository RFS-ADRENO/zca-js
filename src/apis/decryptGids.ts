import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type DecryptGidsResponse = {
    gids: Record<string, string>;
};

export const decryptGidsFactory = apiFactory<DecryptGidsResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.profile[0]}/api/gid/decrypt`);

    /**
     * Giải mã danh sách Global ID (g_...) ẩn danh thành User ID thật
     *
     * @param gids Danh sách Global ID (hoặc 1 GID đơn lẻ)
     * @throws {ZaloApiError}
     */
    return async function decryptGids(gids: string | string[]) {
        if (!gids) throw new ZaloApiError("Missing gids");
        if (!Array.isArray(gids)) gids = [gids];

        const params = {
            gids,
            imei: ctx.imei,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
