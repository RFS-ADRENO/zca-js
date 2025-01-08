import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { MessageType } from "../models/Message.js";
import { apiFactory } from "../utils.js";

export type SendVideoOptions = {
    msg: string;
    videoUrl: string;
    thumbnailUrl: string;
    duration?: number;
    width?: number;
    height?: number;
    ttl?: number;
};

export type SendVideoResponse = {
    msgId: number;
};

export const sendVideoFactory = apiFactory<SendVideoResponse>()((api, ctx, utils) => {
    const directMessageServiceURL = utils.makeURL(`${api.zpwServiceMap.file[0]}/api/message/forward`);
    const groupMessageServiceURL = utils.makeURL(`${api.zpwServiceMap.file[0]}/api/group/forward`);

    /**
     * Send a video to a User - Group
     *
     * @param message Optional message to send along with the video
     * @param videoUrl URL of the video
     * @param thumbnailUrl URL of the thumbnail
     * @param threadId ID of the user or group to send the video to
     * @param threadType Type of thread (USER or GROUP)
     * @param duration Video duration in milliseconds || Eg: video duration: 5.5s => 5.5 * 1000 = 5500
     * @param width Width of the video
     * @param height Height of the video
     * @param ttl Time to live in miliseconds (default: 0)
     *
     * @throws ZaloApiError
     *
     * @examples Example Video Resolutions:
     *   - **Standard Videos**:
     *       - 3840x2160 (4K UHD): Width 3840px, Height 2160px.
     *       - 1920x1080 (Full HD): Width 1920px, Height 1080px.
     *       - 1280x720 (HD): Width 1280px, Height 720px.
     *   - **Document-Oriented Videos** (Portrait):
     *       - 3840x2160 (4K UHD): Width 3840px, Height 2160px.
     *       - 720x1280 (HD): Width 720px, Height 1280px.
     *       - 1440x2560 (2K): Width 1440px, Height 2560px.
     *
     */
    return async function sendVideo(
        options: SendVideoOptions,
        threadId: string,
        threadType: MessageType = MessageType.DirectMessage,
    ) {
        let fileSize: number = 0;
        let clientId = Date.now();

        try {
            const headResponse = await utils.request(options.videoUrl, { method: "HEAD" }, true);
            if (headResponse.ok) {
                fileSize = parseInt(headResponse.headers.get("content-length") || "0");
            }
        } catch (error: any) {
            throw new ZaloApiError(`Unable to get video content: ${error?.message || error}`);
        }

        const params: any = {
            clientId: String(clientId),
            ttl: options.ttl ?? 0,
            zsource: 704,
            msgType: 5,
            msgInfo: JSON.stringify({
                videoUrl: options.videoUrl,
                thumbUrl: options.thumbnailUrl,
                duration: options.duration ?? 0,
                width: options.width ?? 1280,
                height: options.height ?? 720,
                fileSize: fileSize,
                properties: {
                    color: -1,
                    size: -1,
                    type: 1003,
                    subType: 0,
                    ext: {
                        sSrcType: -1,
                        sSrcStr: "",
                        msg_warning_type: 0,
                    },
                },
                title: options.msg,
            }),
        };

        // @TODO later
        // if (typeof message !== "string" && message.mention) {
        //     params.mentionInfo = message.mention;
        // }

        let serviceURL;
        if (threadType === 0) {
            serviceURL = directMessageServiceURL;
            params.toId = threadId;
            params.imei = ctx.imei;
        } else if (threadType === 1) {
            serviceURL = groupMessageServiceURL;
            params.visibility = 0;
            params.grid = threadId;
            params.imei = ctx.imei;
        } else {
            throw new ZaloApiError("Thread type is invalid");
        }

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
