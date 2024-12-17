import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory, encodeAES, makeURL, request } from "../utils.js";

export type SendCardResponse = {
    msgId: number;
};

export const sendCardFactory = apiFactory<SendCardResponse>()((api, ctx, resolve) => {
    const directMessageServiceURL = makeURL(`${api.zpwServiceMap.file[0]}/api/message/forward`);
    const groupMessageServiceURL = makeURL(`${api.zpwServiceMap.file[0]}/api/group/forward`);

    /**
     * Send a card to a User - Group
     *
     * @param userId Unique ID of the recipient
     * @param threadId Unique ID of the conversation
     * @param threadType 0 = USER, 1 = GROUPGROUP
     * @param phoneNumber Optional phone number for sending card to a User
     * @param ttl Time to live in seconds (default: 0)
     *
     * @throws ZaloApiError
     *
     */
    return async function sendCard(userId: string, threadId: string, threadType: number, phoneNumber: string, ttl: number = 0) {
        const data = await api.getQR(userId);
        const QRCodeURL = Object.values(data)[0];
        let clientId = Date.now();

        const params: any = {
            ttl: ttl,
            msgType: 6,
            clientId: String(clientId),
            msgInfo: {
                contactUid: userId,
                qrCodeUrl: QRCodeURL,
            },
        };

        if (phoneNumber) {
            params.msgInfo.phone = phoneNumber;
        }

        let serviceURL;
        if (threadType === 0) {
            serviceURL = directMessageServiceURL;
            params.toId = threadId;
            params.imei = ctx.imei;
        } else if (threadType === 1) {
            serviceURL = groupMessageServiceURL;
            params.visibility = 0;
            params.grid = threadId;
        } else {
            throw new ZaloApiError("Thread type is invalid");
        }

        const msgInfoStringified = JSON.stringify(params.msgInfo);
        params.msgInfo = msgInfoStringified;

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
