import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { ThreadType } from "../models/Enum.js";
import { apiFactory } from "../utils.js";

export type Data = {
    updateId: number;
};

export type AddUnreadMarkResponse = {
    data: Data;
    status: number;
};

export const addUnreadMarkFactory = apiFactory<AddUnreadMarkResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.conversation[0]}/api/conv/addUnreadMark`);

    /**
     * Add unread mark to conversation
     *
     * @param threadId Thread ID
     * @param type Thread type (User/Group)
     *
     * @throws ZaloApiError
     */
    return async function addUnreadMark(threadId: string, type: ThreadType = ThreadType.User) {
        const timestamp = Date.now();
        const timestampString = Date.now().toString();

        const requestParams = {
            param: JSON.stringify({
                convsGroup:
                    type === ThreadType.Group
                        ? [
                              {
                                  id: threadId,
                                  cliMsgId: timestampString,
                                  fromUid: "0",
                                  ts: timestamp,
                              },
                          ]
                        : [],
                convsUser:
                    type === ThreadType.User
                        ? [
                              {
                                  id: threadId,
                                  cliMsgId: timestampString,
                                  fromUid: "0",
                                  ts: timestamp,
                              },
                          ]
                        : [],
                imei: ctx.imei,
            }),
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(requestParams));
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
