import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { ThreadType } from "../models/Enum.js";
import { apiFactory } from "../utils.js";

export type DeleteChatResponse = {
    status: number;
};

export type ConverInfo = {
    ownerId: string; // no hope <(")
    globalMsgId: string; // no hope <(")
};

export const deleteChatFactory = apiFactory<DeleteChatResponse>()((api, ctx, utils) => {
    const serviceURL = {
        [ThreadType.User]: utils.makeURL(`${api.zpwServiceMap.chat[0]}/api/message/deleteconver`, {
            nretry: 0,
        }),
        [ThreadType.Group]: utils.makeURL(`${api.zpwServiceMap.group[0]}/api/group/deleteconver`, {
            nretry: 0,
        }),
    };

    /**
     * Delete chat
     *
     * @param converInfo Conversation info containing ownerId and globalMsgId
     * @param threadId Thread ID (toid for User, grid for Group)
     * @param type Thread type
     *
     * @throws ZaloApiError
     */
    return async function deleteChat(converInfo: ConverInfo, threadId: string, type: ThreadType = ThreadType.User) {
        const timestampString = Date.now().toString();

        const params =
            type === ThreadType.User
                ? {
                      toid: threadId,
                      cliMsgId: timestampString,
                      conver: {
                          ...converInfo,
                          cliMsgId: timestampString,
                      },
                      onlyMe: 1,
                      imei: ctx.imei,
                  }
                : {
                      grid: threadId,
                      cliMsgId: timestampString,
                      conver: {
                          ...converInfo,
                          cliMsgId: timestampString,
                      },
                      onlyMe: 1,
                      imei: ctx.imei,
                  };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(serviceURL[type].toString(), {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });

        return utils.resolve(response);
    };
});
