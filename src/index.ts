import cryptojs from "crypto-js";
import { login } from "./apis/login.js";
import { ListenerBase, ListenerOptions } from "./apis/listen.js";
import { getOwnId } from "./apis/getOwnId.js";
import { makeURL } from "./utils.js";
import { appContext } from "./context.js";

import { getStickersFactory } from "./apis/getStickers.js";
import { sendStickerFactory } from "./apis/sendSticker.js";
import { sendMessageFactory } from "./apis/sendMessage.js";
import { addReactionFactory } from "./apis/addReaction.js";
import { findUserFactory } from "./apis/findUser.js";
import { uploadAttachmentFactory } from "./apis/uploadAttachment.js";
import { sendMessageAttachmentFactory } from "./apis/sendMessageAttachment.js";

export type Credentials = {
    imei: string;
    cookie: string;
    userAgent: string;
    language?: string;
    options?: ListenerOptions;
};

export class Zalo {
    public static readonly API_TYPE = 30;
    public static readonly API_VERSION = 636;

    private enableEncryptParam = true;
    private listenerOptions?: ListenerOptions;

    constructor(credentials: Credentials) {
        this.validateParams(credentials);

        appContext.imei = credentials.imei;
        appContext.cookie = credentials.cookie;
        appContext.userAgent = credentials.userAgent;
        appContext.language = credentials.language || "vi";

        appContext.secretKey = null;

        this.listenerOptions = credentials.options;
    }

    private validateParams(credentials: Credentials) {
        if (!credentials.imei || !credentials.cookie || !credentials.userAgent) {
            throw new Error("Missing required params");
        }

        const md5UserAgent = cryptojs.MD5(credentials.userAgent).toString();
        const md5UserAgentFromImei = credentials.imei.slice(credentials.imei.lastIndexOf("-") + 1);

        if (md5UserAgent !== md5UserAgentFromImei) {
            throw new Error("Mismatched imei and userAgent");
        }
    }

    public async login() {
        const loginData = await login(this.enableEncryptParam);

        if (!loginData) throw new Error("Failed to login");
        appContext.secretKey = loginData.data.zpw_enk;
        appContext.uid = loginData.data.uid;

        console.log("Logged in as", loginData.data.uid);

        return new API(
            appContext.secretKey!,
            loginData.data.zpw_service_map_v3,
            makeURL(`${loginData.data.zpw_ws[0]}`, {
                zpw_ver: Zalo.API_VERSION,
                zpw_type: Zalo.API_TYPE,
                t: Date.now(),
            }),
            this.listenerOptions
        );
    }
}

export class API {
    private secretKey: string;
    private zpwServiceMap: Record<string, string[]>;

    public listen: ListenerBase;
    public sendMessage: ReturnType<typeof sendMessageFactory>;
    public addReaction: ReturnType<typeof addReactionFactory>;
    public getOwnId: typeof getOwnId;
    public getStickers: ReturnType<typeof getStickersFactory>;
    public sendSticker: ReturnType<typeof sendStickerFactory>;
    public findUser: ReturnType<typeof findUserFactory>;
    public uploadAttachment: ReturnType<typeof uploadAttachmentFactory>;
    public sendMessageAttachment: ReturnType<typeof sendMessageAttachmentFactory>;

    constructor(secretKey: string, zpwServiceMap: Record<string, string[]>, wsUrl: string, options?: ListenerOptions) {
        this.secretKey = secretKey;
        this.zpwServiceMap = zpwServiceMap;
        this.listen = new ListenerBase(wsUrl, options);
        this.sendMessage = sendMessageFactory(
            makeURL(`${zpwServiceMap.chat[0]}/api/message`, {
                zpw_ver: Zalo.API_VERSION,
                zpw_type: Zalo.API_TYPE,
                nretry: 0,
            })
        );
        this.addReaction = addReactionFactory(
            makeURL(`${zpwServiceMap.reaction[0]}/api/message/reaction`, {
                zpw_ver: Zalo.API_VERSION,
                zpw_type: Zalo.API_TYPE
            })
        );
        this.getOwnId = getOwnId;
        this.getStickers = getStickersFactory(
            makeURL(`${zpwServiceMap.sticker}/api/message/sticker`, {
                zpw_ver: Zalo.API_VERSION,
                zpw_type: Zalo.API_TYPE,
            })
        );
        this.sendSticker = sendStickerFactory(
            makeURL(`${zpwServiceMap.chat[0]}/api/message/sticker`, {
                zpw_ver: Zalo.API_VERSION,
                zpw_type: Zalo.API_TYPE,
            })
        );
        this.findUser = findUserFactory(
            makeURL(`${zpwServiceMap.friend[0]}/api/friend/profile/get`, {
                zpw_ver: Zalo.API_VERSION,
                zpw_type: Zalo.API_TYPE,
            })
        );
        this.uploadAttachment = uploadAttachmentFactory(
            `${zpwServiceMap.file[0]}/api`,
            this
        );
        this.sendMessageAttachment = sendMessageAttachmentFactory(
            `${zpwServiceMap.file[0]}/api`,
            this
        )
    }
}