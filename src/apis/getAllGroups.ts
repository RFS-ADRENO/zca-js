import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { handleZaloResponse, request } from "../utils.js";

export type GetAllGroupsResponse = {
    version: string;
    gridInfoMap: Record<string, string>;
};

export function getAllGroupsFactory(serviceURL: string) {
    return async function getAllGroups() {

        const response = await request(serviceURL, {
            method: "GET",
        });

        const result = await handleZaloResponse<GetAllGroupsResponse>(response);
        if (result.error) throw new ZaloApiError(result.error.message, result.error.code);

        return result.data as GetAllGroupsResponse;
    };
}
