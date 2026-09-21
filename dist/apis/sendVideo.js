import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { ThreadType } from "../models/index.js";
import { apiFactory } from "../utils.js";
export const sendVideoFactory = apiFactory()((api, ctx, utils) => {
    const serviceURL = {
        [ThreadType.User]: utils.makeURL(`${api.zpwServiceMap.file[0]}/api/message/forward`),
        [ThreadType.Group]: utils.makeURL(`${api.zpwServiceMap.file[0]}/api/group/forward`),
    };
    /**
     * Send a video to a User - Group
     *
     * @param options send video options
     * @param threadId ID of the user or group to send the video to
     * @param type Type of thread (USER or GROUP)
     *
     * @throws {ZaloApiError}
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
    return async function sendVideo(options, threadId, type = ThreadType.User) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        let fileSize = 0;
        const clientId = Date.now();
        try {
            const headResponse = await utils.request(options.videoUrl, { method: "HEAD" }, true);
            if (headResponse.ok) {
                fileSize = parseInt(headResponse.headers.get("content-length") || "0");
            }
        }
        catch (error) {
            throw new ZaloApiError(`Unable to get video content: ${error instanceof Error ? error.message : String(error)}`);
        }
        const params = type === ThreadType.User
            ? {
                toId: threadId,
                clientId: String(clientId),
                ttl: (_a = options.ttl) !== null && _a !== void 0 ? _a : 0,
                zsource: 704,
                msgType: 5,
                msgInfo: JSON.stringify({
                    videoUrl: options.videoUrl,
                    thumbUrl: options.thumbnailUrl,
                    duration: (_b = options.duration) !== null && _b !== void 0 ? _b : 0,
                    width: (_c = options.width) !== null && _c !== void 0 ? _c : 1280,
                    height: (_d = options.height) !== null && _d !== void 0 ? _d : 720,
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
                    title: (_e = options.msg) !== null && _e !== void 0 ? _e : "",
                }),
                imei: ctx.imei,
            }
            : {
                grid: threadId,
                visibility: 0,
                clientId: String(clientId),
                ttl: (_f = options.ttl) !== null && _f !== void 0 ? _f : 0,
                zsource: 704,
                msgType: 5,
                msgInfo: JSON.stringify({
                    videoUrl: options.videoUrl,
                    thumbUrl: options.thumbnailUrl,
                    duration: (_g = options.duration) !== null && _g !== void 0 ? _g : 0,
                    width: (_h = options.width) !== null && _h !== void 0 ? _h : 1280,
                    height: (_j = options.height) !== null && _j !== void 0 ? _j : 720,
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
                    title: (_k = options.msg) !== null && _k !== void 0 ? _k : "",
                }),
                imei: ctx.imei,
            };
        // @TODO: later
        // if (typeof message !== "string" && message.mention) {
        //     params.mentionInfo = message.mention;
        // }
        if (type !== ThreadType.User && type !== ThreadType.Group) {
            throw new ZaloApiError("Thread type is invalid");
        }
        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams)
            throw new ZaloApiError("Failed to encrypt params");
        const response = await utils.request(serviceURL[type], {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });
        return utils.resolve(response);
    };
});
