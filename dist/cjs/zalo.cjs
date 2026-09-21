'use strict';

var loginQR = require('./apis/loginQR.cjs');
var login = require('./apis/login.cjs');
var context = require('./context.cjs');
var utils = require('./utils.cjs');
var toughCookie = require('tough-cookie');
var ZaloApiError = require('./Errors/ZaloApiError.cjs');
var update = require('./update.cjs');
var apis = require('./apis.cjs');

class Zalo {
    constructor(options = {}) {
        this.options = options;
        this.enableEncryptParam = true;
    }
    parseCookies(cookie) {
        const cookieArr = Array.isArray(cookie) ? cookie : cookie.cookies;
        cookieArr.forEach((e, i) => {
            if (typeof e.domain == "string" && e.domain.startsWith("."))
                cookieArr[i].domain = e.domain.slice(1);
        });
        const jar = new toughCookie.CookieJar();
        for (const each of cookieArr) {
            try {
                const cookieObj = toughCookie.Cookie.fromJSON(Object.assign(Object.assign({}, each), { key: each.key || each.name }));
                if (cookieObj) {
                    const domain = cookieObj.domain || "chat.zalo.me";
                    const url = `https://${domain.startsWith(".") ? domain.slice(1) : domain}`;
                    jar.setCookieSync(cookieObj, url);
                }
            }
            catch (error) {
                utils.logger({
                    options: {
                        logging: this.options.logging,
                    },
                }).error("Failed to set cookie:", error);
            }
        }
        return jar;
    }
    validateParams(credentials) {
        if (!credentials.imei || !credentials.cookie || !credentials.userAgent) {
            throw new ZaloApiError.ZaloApiError("Missing required params");
        }
    }
    async login(credentials) {
        const ctx = context.createContext(this.options.apiType, this.options.apiVersion);
        Object.assign(ctx.options, this.options);
        return this.loginCookie(ctx, credentials);
    }
    async loginCookie(ctx, credentials) {
        await update.checkUpdate(ctx);
        this.validateParams(credentials);
        ctx.imei = credentials.imei;
        ctx.cookie = this.parseCookies(credentials.cookie);
        ctx.userAgent = credentials.userAgent;
        ctx.language = credentials.language || "vi";
        const loginData = await login.login(ctx, this.enableEncryptParam);
        const serverInfo = await login.getServerInfo(ctx, this.enableEncryptParam);
        const loginInfo = loginData === null || loginData === void 0 ? void 0 : loginData.data;
        if (!loginData || !loginInfo || !serverInfo)
            throw new ZaloApiError.ZaloApiError("Đăng nhập thất bại");
        ctx.secretKey = loginInfo.zpw_enk;
        ctx.uid = loginInfo.uid;
        // Zalo currently responds with setttings instead of settings
        // they might fix this in the future, so we should have a fallback just in case
        ctx.settings = serverInfo.setttings || serverInfo.settings;
        ctx.extraVer = serverInfo.extra_ver;
        ctx.loginInfo = loginInfo;
        if (!context.isContextSession(ctx))
            throw new ZaloApiError.ZaloApiError("Khởi tạo ngữ cảnh thất bại.");
        utils.logger(ctx).info("Logged in as", loginInfo.uid);
        return new apis.API(ctx, loginInfo.zpw_service_map_v3, loginInfo.zpw_ws);
    }
    async loginQR(options, callback) {
        if (!options)
            options = {};
        if (!options.userAgent)
            options.userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0";
        if (!options.language)
            options.language = "vi";
        const ctx = context.createContext(this.options.apiType, this.options.apiVersion);
        Object.assign(ctx.options, this.options);
        const loginQRResult = await loginQR.loginQR(ctx, options, callback);
        if (!loginQRResult)
            throw new ZaloApiError.ZaloApiError("Unable to login with QRCode");
        const imei = utils.generateZaloUUID(options.userAgent);
        if (callback) {
            // Thanks to @YanCastle for this great suggestion!
            callback({
                type: loginQR.LoginQRCallbackEventType.GotLoginInfo,
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

exports.API = apis.API;
exports.Zalo = Zalo;
