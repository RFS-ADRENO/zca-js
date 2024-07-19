import cryptojs from "crypto-js";
import { login } from "./apis/login.js";
import { ListenerBase, ListenerOptions } from "./apis/listen.js";
import { sendMessageFactory } from "./apis/sendMessage.js";
import { getOwnId } from "./apis/getOwnId.js";
import { makeURL } from "./utils.js";
import { appContext } from "./context.js";

export type Credentials = {
    imei: string;
    cookie: string;
    userAgent: string;
    language?: string;
};

export class Zalo {
    public static readonly API_TYPE = 30;
    public static readonly API_VERSION = 635;

    private enableEncryptParam = true;

    constructor(credentials: Credentials) {
        this.validateParams(credentials);

        appContext.imei = credentials.imei;
        appContext.cookie = credentials.cookie;
        appContext.userAgent = credentials.userAgent;
        appContext.language = credentials.language || "vi";

        appContext.secretKey = null;
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
            })
        );
    }
}

class API {
    private secretKey: string;
    private zpwServiceMap: Record<string, string[]>;

    public Listener: ReturnType<typeof getListener>;
    public sendMessage: ReturnType<typeof sendMessageFactory>;
    public getOwnId: typeof getOwnId;

    constructor(secretKey: string, zpwServiceMap: Record<string, string[]>, wsUrl: string) {
        this.secretKey = secretKey;
        this.zpwServiceMap = zpwServiceMap;
        this.Listener = getListener(wsUrl);
        this.sendMessage = sendMessageFactory(
            makeURL(`${zpwServiceMap.chat[0]}/api/message`, {
                zpw_ver: Zalo.API_VERSION,
                zpw_type: Zalo.API_TYPE,
                nretry: 0,
            })
        );
        this.getOwnId = getOwnId;
    }
}

function getListener(url: string) {
    class Listener extends ListenerBase {
        constructor(options?: ListenerOptions) {
            super(url, options);
        }
    }

    return Listener;
}
