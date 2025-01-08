import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { MessageType } from "../models/Message.js";
import { apiFactory } from "../utils.js";

export type SendCardOptions = {
    userId: string;
    phoneNumber?: string;
    ttl?: number;
};

export type SendCardResponse = {
    msgId: number;
};

export const sendCardFactory = apiFactory<SendCardResponse>()((api, ctx, utils) => {
    const directMessageServiceURL = utils.makeURL(`${api.zpwServiceMap.file[0]}/api/message/forward`);
    const groupMessageServiceURL = utils.makeURL(`${api.zpwServiceMap.file[0]}/api/group/forward`);

    /**
     * Send a card to a User - Group
     *
     * @param userId Unique ID for Card
     * @param phoneNumber Optional phone number for sending card to a User
     * @param ttl Time to live in miliseconds (default: 0)
     * @param threadId ID of the conversation
     * @param type Message type (DirectMessage or GroupMessage)
     *
     * @throws ZaloApiError
     *
     */
    return async function sendCard(options: SendCardOptions, threadId: string, type: MessageType = MessageType.DirectMessage) {
        const data = await api.getQR(options.userId);
        const QRCodeURL = data[options.userId];
        const clientId = Date.now().toString();

        const params: any = {
            ttl: options.ttl ?? 0,
            msgType: 6,
            clientId: clientId,
            msgInfo: {
                contactUid: options.userId,
                qrCodeUrl: QRCodeURL,
            },
        };

        if (options.phoneNumber) {
            params.msgInfo.phone = options.phoneNumber;
        }

        let serviceURL;
        if (type == MessageType.GroupMessage) {
            serviceURL = groupMessageServiceURL;
            params.visibility = 0;
            params.grid = threadId;
        } else {
            serviceURL = directMessageServiceURL;
            params.toId = threadId;
            params.imei = ctx.imei;
        }

        const msgInfoStringified = JSON.stringify(params.msgInfo);
        params.msgInfo = msgInfoStringified;

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
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
