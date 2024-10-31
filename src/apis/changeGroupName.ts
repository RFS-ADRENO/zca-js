import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory, encodeAES, makeURL, request } from "../utils.js";

export type ChangeGroupNameResponse = {
    status: number;
};

export const changeGroupNameFactory = apiFactory<ChangeGroupNameResponse>()((api, ctx, resolve) => {
    const serviceURL = makeURL(`${api.zpwServiceMap.group[0]}/api/group/updateinfo`);

    /**
     * Change group name
     *
     * @param groupId Group ID
     * @param name New group name
     *
     * @throws ZaloApiError
     */
    return async function changeGroupName(groupId: string, name: string) {
        if (name.length == 0) name = Date.now().toString();

        const params: any = {
            grid: groupId,
            gname: name,
            imei: ctx.imei,
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
