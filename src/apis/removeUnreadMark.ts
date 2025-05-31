import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { ThreadType } from "../models/Enum.js";
import { apiFactory } from "../utils.js";

export type Data = {
    updateId: number;
};

export type RemoveUnreadMarkResponse = {
    data: Data;
    status: number;
};

export type UnreadMarkParams = {
    threadId: string;
    cliMsgId: string;
    fromUid?: string;
};

export const removeUnreadMarkFactory = apiFactory<RemoveUnreadMarkResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.conversation[0]}/api/conv/removeUnreadMark`);

    /**
     * Remove unread mark from conversation
     *
     * @param params Unread mark parameters
     * @param type Thread type (User/Group)
     *
     * @throws ZaloApiError
     */
    return async function removeUnreadMark(params: UnreadMarkParams, type: ThreadType = ThreadType.User) {
        const timestamp = Date.now();

        const requestParams = {
            param: JSON.stringify({
                convsGroup: type === ThreadType.Group ? [params.threadId] : [],
                convsUser: type === ThreadType.User ? [params.threadId] : [],
                convsGroupData:
                    type === ThreadType.Group
                        ? [
                              {
                                  id: params.threadId,
                                  ts: timestamp,
                              },
                          ]
                        : [],
                convsUserData:
                    type === ThreadType.User
                        ? [
                              {
                                  id: params.threadId,
                                  ts: timestamp,
                              },
                          ]
                        : [],
            }),
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(requestParams));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(serviceURL.toString(), {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });

        return utils.resolve(response);
    };
});
