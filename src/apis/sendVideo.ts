import { getVideoDurationInSeconds } from "get-video-duration";
import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory, encodeAES, makeURL, request } from "../utils.js";

type Message =
    | {
          text: string;
          mention: any;
      }
    | string;

export type SendVideoResponse = {
    msgId: number;
};

export const sendVideoFactory = apiFactory<SendVideoResponse>()((api, ctx, resolve) => {
    const directMessageServiceURL = makeURL(`${api.zpwServiceMap.file[0]}/api/message/forward`);
    const groupMessageServiceURL = makeURL(`${api.zpwServiceMap.file[0]}/api/group/forward`);

    /**
     * Send a video to a User - Group
     *
     * @param message Optional message to send along with the video
     * @param videoUrl URL of the video
     * @param thumbnailUrl URL of the thumbnail
     * @param threadId ID of the user or group to send the video to
     * @param threadType Type of thread (USER or GROUP)
     * @param width Width of the video
     * @param height Height of the video
     * @param ttl Time to live for the message
     *
     * @throws ZaloApiError
     * 
     * @Videongang - 3840x2160 (4K UHD): Rộng 3840px, cao 2160px
     * @Videongang - 1920x1080 (Full HD): Rộng 1920px, cao 1080px
     * @Videongang - 1280x720 (HD): Rộng 1280px, cao 720px
     * 
     * @Videodoc - 3840x2160 (4K UHD): Rộng 3840px, cao 2160px
     * @Videodoc - 720x1280 (HD): Rộng 720px, cao 1280px
     * @Videodoc - 1440x2560 (2K): Rộng 1440px, cao 2560px
     * 
     */
    return async function sendVideo(message: Message, videoUrl: string, thumbnailUrl: string, threadId: string, threadType: number, width: number = 1280, height: number = 720, ttl: number = 0) {
        let fileSize: number = 0;
        let clientId = Date.now();

        const durationInSeconds = await getVideoDurationInSeconds(videoUrl);
        const duration = Math.round(durationInSeconds * 1000);
        try {
            const headResponse = await request(videoUrl, { method: "HEAD" });
            if (headResponse.ok) {
                fileSize = parseInt(headResponse.headers.get("content-length") || "0");
            }
        } catch (error: any) {
            throw new ZaloApiError(`Unable to get video content: ${error.message}`);
        }

        const params: any = {
            clientId: String(clientId),
            ttl: ttl,
            zsource: 704,
            msgType: 5,
            msgInfo: JSON.stringify({
                videoUrl: videoUrl,
                thumbUrl: thumbnailUrl,
                duration: duration,
                width: width,
                height: height,
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
                title: `${typeof message == "string" ? message : message.text}`
            }),
        };

        if (typeof message !== "string" && message.mention) {
            params.mentionInfo = message.mention;
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
            params.imei = ctx.imei;
        } else {
            throw new ZaloApiError("Thread type is invalid");
        }

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
