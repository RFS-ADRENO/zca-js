import { apiFactory } from "../utils.js";

export type GetAllGroupsResponse = {
    version: string;
    gridVerMap: {
        [groupId: string]: string;
    };
};

export const getAllGroupsFactory = apiFactory<GetAllGroupsResponse>()((api, _, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.group_poll[0]}/api/group/getlg/v4`);

    return async function getAllGroups() {
        const response = await utils.request(serviceURL, {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
