import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type ChangeGroupOwnerResponse = {
    time: number;
};

export const changeGroupOwnerFactory = apiFactory<ChangeGroupOwnerResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.group[0]}/api/group/change-owner`);

    /**
     * Change group owner
     *
     * @param memberId User Id of new group owner
     * @param groupId Group Id
     * @notes Be careful when changing the key, as it will result in losing group admin rights
     *
     * @throws ZaloApiError
     *
     */
    return async function changeGroupOwner(memberId: string, groupId: string) {
        const params = {
            grid: groupId,
            newAdminId: memberId,
            imei: ctx.imei,
            language: ctx.language,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
