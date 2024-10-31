import { apiFactory, makeURL, request } from "../utils.js";

export type GetAllGroupsResponse = {
    version: string;
    gridInfoMap: Record<string, string>;
};

export const getAllGroupsFactory = apiFactory<GetAllGroupsResponse>()((api, ctx, resolve) => {
    const serviceURL = makeURL(`${api.zpwServiceMap.group_poll[0]}/api/group/getlg/v4`);

    return async function getAllGroups() {
        const response = await request(serviceURL, {
            method: "GET",
        });

        return resolve(response);
    };
});
