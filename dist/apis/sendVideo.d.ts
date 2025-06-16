import { ThreadType } from "../models/index.js";
export type SendVideoOptions = {
    /**
     * Optional message to send along with the video
     */
    msg?: string;
    /**
     * URL of the video
     */
    videoUrl: string;
    /**
     * URL of the thumbnail
     */
    thumbnailUrl: string;
    /**
     * Video duration in milliseconds || Eg: video duration: 5.5s => 5.5 * 1000 = 5500
     */
    duration?: number;
    /**
     * Width of the video
     */
    width?: number;
    /**
     * Height of the video
     */
    height?: number;
    /**
     * Time to live in miliseconds (default: 0)
     */
    ttl?: number;
};
export type SendVideoResponse = {
    msgId: number;
};
export declare const sendVideoFactory: (ctx: import("../context.js").ContextBase, api: import("../zalo.js").API) => (options: SendVideoOptions, threadId: string, type?: ThreadType) => Promise<SendVideoResponse>;
