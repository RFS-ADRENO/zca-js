import { loginQR, LoginQRCallbackEventType, type LoginQRCallback } from "./apis/account/loginQR.js";
import { getServerInfo, login } from "./apis/account/login.js";
import {
    createContext,
    isContextSession,
    type ContextBase,
    type Options,
} from "./context.js";
import { generateZaloUUID, logger } from "./utils/index.js";

import toughCookie from "tough-cookie";

import { ZaloApiError } from "./Errors/ZaloApiError.js";
import { checkUpdate } from "./update.js";
import { API } from "./apis.js";

export type Cookie = {
    domain: string;
    expirationDate: number;
    hostOnly: boolean;
    httpOnly: boolean;
    name: string;
    path: string;
    sameSite: string;
    secure: boolean;
    session: boolean;
    storeId: string;
    value: string;
};

export type Credentials = {
    imei: string;
    cookie: Cookie[] | toughCookie.SerializedCookie[] | { url: string; cookies: Cookie[] };
    userAgent: string;
    language?: string;
};

export class Zalo {
    private enableEncryptParam = true;

    constructor(private options: Partial<Options> = {}) { }

    private parseCookies(cookie: Credentials["cookie"]): toughCookie.CookieJar {
        const cookieArr = Array.isArray(cookie) ? cookie : cookie.cookies;

        cookieArr.forEach((e, i) => {
            if (typeof e.domain == "string" && e.domain.startsWith(".")) cookieArr[i].domain = e.domain.slice(1);
        });

        const jar = new toughCookie.CookieJar();
        for (const each of cookieArr) {
            try {
                const cookieObj = toughCookie.Cookie.fromJSON({
                    ...each,
                    key: (each as toughCookie.SerializedCookie).key || each.name,
                });
                if (cookieObj) {
                    const domain = cookieObj.domain || "chat.zalo.me";
                    const url = `https://${domain.startsWith(".") ? domain.slice(1) : domain}`;
                    jar.setCookieSync(cookieObj, url);
                }
            } catch (error: unknown) {
                logger({
                    options: {
                        logging: this.options.logging,
                    },
                }).error("Failed to set cookie:", error);
            }
        }
        return jar;
    }

    private validateParams(credentials: Credentials) {
        if (!credentials.imei || !credentials.cookie || !credentials.userAgent) {
            throw new ZaloApiError("Missing required params");
        }
    }

    public async login(credentials: Credentials) {
        const ctx = createContext(this.options.apiType, this.options.apiVersion);
        Object.assign(ctx.options, this.options);

        return this.loginCookie(ctx, credentials);
    }

    private async loginCookie(ctx: ContextBase, credentials: Credentials) {
        await checkUpdate(ctx);

        this.validateParams(credentials);

        ctx.imei = credentials.imei;
        ctx.cookie = this.parseCookies(credentials.cookie);
        ctx.userAgent = credentials.userAgent;
        ctx.language = credentials.language || "vi";

        const loginData = await login(ctx, this.enableEncryptParam);
        const serverInfo = await getServerInfo(ctx, this.enableEncryptParam);

        const loginInfo = loginData?.data as typeof ctx.loginInfo;

        if (!loginData || !loginInfo || !serverInfo) throw new ZaloApiError("Đăng nhập thất bại");

        ctx.secretKey = loginInfo.zpw_enk;
        ctx.uid = loginInfo.uid;

        // Zalo currently responds with setttings instead of settings
        // they might fix this in the future, so we should have a fallback just in case
        ctx.settings = serverInfo.setttings || serverInfo.settings;

        ctx.extraVer = serverInfo.extra_ver;
        ctx.loginInfo = loginInfo;

        if (!isContextSession(ctx)) throw new ZaloApiError("Khởi tạo ngữ cảnh thất bại.");

        logger(ctx).info("Logged in as", loginInfo.uid);

        return new API(ctx, loginInfo.zpw_service_map_v3, loginInfo.zpw_ws);
    }

    public async loginQR(
        options?: { userAgent?: string; language?: string; qrPath?: string },
        callback?: LoginQRCallback,
    ) {
        if (!options) options = {};
        if (!options.userAgent)
            options.userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0";
        if (!options.language) options.language = "vi";

        const ctx = createContext(this.options.apiType, this.options.apiVersion);
        Object.assign(ctx.options, this.options);

        const loginQRResult = await loginQR(
            ctx,
            options as { userAgent: string; language: string; qrPath?: string },
            callback,
        );
        if (!loginQRResult) throw new ZaloApiError("Unable to login with QRCode");

        const imei = generateZaloUUID(options.userAgent);

        if (callback) {
            // Thanks to @YanCastle for this great suggestion!
            callback({
                type: LoginQRCallbackEventType.GotLoginInfo,
                data: {
                    cookie: loginQRResult.cookies,
                    imei,
                    userAgent: options.userAgent,
                },
                actions: null,
            });
        }

        return this.loginCookie(ctx, {
            cookie: loginQRResult.cookies,
            imei,
            userAgent: options.userAgent,
            language: options.language,
        });
    }
}

export { API };
