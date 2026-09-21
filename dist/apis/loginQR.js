import { CookieJar } from "tough-cookie";
import { writeFile } from "node:fs/promises";
import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { logger, request } from "../utils.js";
import { ZaloApiLoginQRAborted } from "../Errors/ZaloApiLoginQRAborted.js";
import { ZaloApiLoginQRDeclined } from "../Errors/ZaloApiLoginQRDeclined.js";
export var LoginQRCallbackEventType;
(function (LoginQRCallbackEventType) {
    LoginQRCallbackEventType[LoginQRCallbackEventType["QRCodeGenerated"] = 0] = "QRCodeGenerated";
    LoginQRCallbackEventType[LoginQRCallbackEventType["QRCodeExpired"] = 1] = "QRCodeExpired";
    LoginQRCallbackEventType[LoginQRCallbackEventType["QRCodeScanned"] = 2] = "QRCodeScanned";
    LoginQRCallbackEventType[LoginQRCallbackEventType["QRCodeDeclined"] = 3] = "QRCodeDeclined";
    LoginQRCallbackEventType[LoginQRCallbackEventType["GotLoginInfo"] = 4] = "GotLoginInfo";
})(LoginQRCallbackEventType || (LoginQRCallbackEventType = {}));
async function loadLoginPage(ctx) {
    const response = await request(ctx, "https://id.zalo.me/account?continue=https%3A%2F%2Fchat.zalo.me%2F", {
        headers: {
            accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
            "accept-language": "vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5",
            "cache-control": "max-age=0",
            priority: "u=0, i",
            "sec-ch-ua": '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "sec-fetch-dest": "document",
            "sec-fetch-mode": "navigate",
            "sec-fetch-site": "same-site",
            "sec-fetch-user": "?1",
            "upgrade-insecure-requests": "1",
            Referer: "https://chat.zalo.me/",
            "Referrer-Policy": "strict-origin-when-cross-origin",
        },
        method: "GET",
    });
    const html = await response.text();
    const regex = /https:\/\/stc-zlogin\.zdn\.vn\/main-([\d.]+)\.js/;
    const match = html.match(regex);
    return match === null || match === void 0 ? void 0 : match[1];
}
async function getLoginInfo(ctx, version) {
    const form = new URLSearchParams();
    form.append("continue", "https://zalo.me/pc");
    form.append("v", version);
    return await request(ctx, "https://id.zalo.me/account/logininfo", {
        headers: {
            accept: "*/*",
            "accept-language": "vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5",
            "content-type": "application/x-www-form-urlencoded",
            priority: "u=1, i",
            "sec-ch-ua": '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            Referer: "https://id.zalo.me/account?continue=https%3A%2F%2Fzalo.me%2Fpc",
            "Referrer-Policy": "strict-origin-when-cross-origin",
        },
        body: form,
        method: "POST",
    })
        .then((res) => res.json())
        .catch(logger(ctx).error);
}
async function verifyClient(ctx, version) {
    const form = new URLSearchParams();
    form.append("type", "device");
    form.append("continue", "https://zalo.me/pc");
    form.append("v", version);
    return await request(ctx, "https://id.zalo.me/account/verify-client", {
        headers: {
            accept: "*/*",
            "accept-language": "vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5",
            "content-type": "application/x-www-form-urlencoded",
            priority: "u=1, i",
            "sec-ch-ua": '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            Referer: "https://id.zalo.me/account?continue=https%3A%2F%2Fzalo.me%2Fpc",
            "Referrer-Policy": "strict-origin-when-cross-origin",
        },
        body: form,
        method: "POST",
    })
        .then((res) => res.json())
        .catch(logger(ctx).error);
}
async function generate(ctx, version) {
    const form = new URLSearchParams();
    form.append("continue", "https://zalo.me/pc");
    form.append("v", version);
    return await request(ctx, "https://id.zalo.me/account/authen/qr/generate", {
        headers: {
            accept: "*/*",
            "accept-language": "vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5",
            "content-type": "application/x-www-form-urlencoded",
            priority: "u=1, i",
            "sec-ch-ua": '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            Referer: "https://id.zalo.me/account?continue=https%3A%2F%2Fzalo.me%2Fpc",
            "Referrer-Policy": "strict-origin-when-cross-origin",
        },
        body: form,
        method: "POST",
    })
        .then((res) => res.json())
        .catch(logger(ctx).error);
}
async function saveQRCodeToFile(filepath, imageData) {
    await writeFile(filepath, imageData, "base64");
}
async function waitingScan(ctx, version, code, signal) {
    const form = new URLSearchParams();
    form.append("code", code);
    form.append("continue", "https://chat.zalo.me/");
    form.append("v", version);
    return await request(ctx, "https://id.zalo.me/account/authen/qr/waiting-scan", {
        headers: {
            accept: "*/*",
            "accept-language": "vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5",
            "content-type": "application/x-www-form-urlencoded",
            priority: "u=1, i",
            "sec-ch-ua": '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            Referer: "https://id.zalo.me/account?continue=https%3A%2F%2Fchat.zalo.me%2F",
            "Referrer-Policy": "strict-origin-when-cross-origin",
        },
        body: form,
        method: "POST",
        signal,
    })
        .then((res) => res.json())
        .then((data) => {
        if (data.error_code == 8) {
            return waitingScan(ctx, version, code, signal);
        }
        return data;
    })
        .catch((e) => {
        if (!signal.aborted)
            logger(ctx).error(e);
    });
}
async function waitingConfirm(ctx, version, code, signal) {
    const form = new URLSearchParams();
    form.append("code", code);
    form.append("gToken", "");
    form.append("gAction", "CONFIRM_QR");
    form.append("continue", "https://chat.zalo.me/");
    form.append("v", version);
    logger(ctx).info("Please confirm on your phone");
    return await request(ctx, "https://id.zalo.me/account/authen/qr/waiting-confirm", {
        headers: {
            accept: "*/*",
            "accept-language": "vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5",
            "content-type": "application/x-www-form-urlencoded",
            priority: "u=1, i",
            "sec-ch-ua": '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            Referer: "https://id.zalo.me/account?continue=https%3A%2F%2Fchat.zalo.me%2F",
            "Referrer-Policy": "strict-origin-when-cross-origin",
        },
        body: form,
        method: "POST",
        signal,
    })
        .then((res) => res.json())
        .then((data) => {
        if (data.error_code == 8) {
            return waitingConfirm(ctx, version, code, signal);
        }
        return data;
    })
        .catch((e) => {
        if (!signal.aborted)
            logger(ctx).error(e);
    });
}
async function checkSession(ctx) {
    return await request(ctx, "https://id.zalo.me/account/checksession?continue=https%3A%2F%2Fchat.zalo.me%2Findex.html", {
        headers: {
            accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
            "accept-language": "vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5",
            priority: "u=0, i",
            "sec-ch-ua": '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "sec-fetch-dest": "document",
            "sec-fetch-mode": "navigate",
            "sec-fetch-site": "same-origin",
            "upgrade-insecure-requests": "1",
            Referer: "https://id.zalo.me/account?continue=https%3A%2F%2Fchat.zalo.me%2F",
            "Referrer-Policy": "strict-origin-when-cross-origin",
        },
        redirect: "manual",
        method: "GET",
    }).catch(logger(ctx).error);
}
async function getUserInfo(ctx) {
    return await request(ctx, "https://jr.chat.zalo.me/jr/userinfo", {
        headers: {
            accept: "*/*",
            "accept-language": "vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5",
            priority: "u=1, i",
            "sec-ch-ua": '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-site",
            Referer: "https://chat.zalo.me/",
            "Referrer-Policy": "strict-origin-when-cross-origin",
        },
        method: "GET",
    })
        .then((res) => res.json())
        .catch(logger(ctx).error);
}
export async function loginQR(ctx, options, callback) {
    ctx.cookie = new CookieJar();
    ctx.userAgent = options.userAgent;
    return new Promise(async (resolve, reject) => {
        var _a;
        const controller = new AbortController();
        let qrTimeout = null;
        function cleanUp() {
            controller.abort();
            if (qrTimeout) {
                clearTimeout(qrTimeout);
                qrTimeout = null;
            }
        }
        try {
            function retry() {
                cleanUp();
                return resolve(loginQR(ctx, options, callback));
            }
            function abort() {
                cleanUp();
                return reject(new ZaloApiLoginQRAborted());
            }
            if (ctx.options.logging)
                console.log();
            const loginVersion = await loadLoginPage(ctx);
            if (!loginVersion)
                throw new ZaloApiError("Cannot get API login version");
            logger(ctx).info("Got login version:", loginVersion);
            await getLoginInfo(ctx, loginVersion);
            await verifyClient(ctx, loginVersion);
            const qrGenResult = await generate(ctx, loginVersion);
            if (!qrGenResult || !qrGenResult.data)
                throw new ZaloApiError(`Unable to generate QRCode\nResponse: ${JSON.stringify(qrGenResult, null, 2)}`);
            const qrData = qrGenResult.data;
            if (callback) {
                callback({
                    type: LoginQRCallbackEventType.QRCodeGenerated,
                    data: Object.assign(Object.assign({}, qrGenResult.data), { image: qrGenResult.data.image.replace(/^data:image\/png;base64,/, "") }),
                    actions: {
                        async saveToFile(qrPath) {
                            var _a;
                            if (qrPath === void 0) { qrPath = (_a = options.qrPath) !== null && _a !== void 0 ? _a : "qr.png"; }
                            await saveQRCodeToFile(qrPath, qrData.image.replace(/^data:image\/png;base64,/, ""));
                            logger(ctx).info("Scan the QR code at", `'${qrPath}'`, "to proceed with login");
                        },
                        retry,
                        abort,
                    },
                });
            }
            else {
                const qrPath = (_a = options.qrPath) !== null && _a !== void 0 ? _a : "qr.png";
                await saveQRCodeToFile(qrPath, qrData.image.replace(/^data:image\/png;base64,/, ""));
                logger(ctx).info("Scan the QR code at", `'${qrPath}'`, "to proceed with login");
            }
            qrTimeout = setTimeout(() => {
                cleanUp();
                logger(ctx).info("QR expired!");
                if (callback) {
                    callback({
                        type: LoginQRCallbackEventType.QRCodeExpired,
                        data: null,
                        actions: {
                            retry,
                            abort,
                        },
                    });
                }
                else {
                    retry();
                }
            }, 100000);
            const scanResult = await waitingScan(ctx, loginVersion, qrGenResult.data.code, controller.signal);
            if (!scanResult || !scanResult.data)
                throw new ZaloApiError("Cannot get scan result");
            if (callback) {
                callback({
                    type: LoginQRCallbackEventType.QRCodeScanned,
                    data: scanResult.data,
                    actions: {
                        retry,
                        abort,
                    },
                });
            }
            const confirmResult = await waitingConfirm(ctx, loginVersion, qrGenResult.data.code, controller.signal);
            if (!confirmResult)
                throw new ZaloApiError("Cannot get confirm result");
            clearTimeout(qrTimeout);
            if (confirmResult.error_code == -13) {
                if (callback) {
                    callback({
                        type: LoginQRCallbackEventType.QRCodeDeclined,
                        data: {
                            code: qrData.code,
                        },
                        actions: {
                            retry,
                            abort,
                        },
                    });
                }
                else {
                    logger(ctx).error("QRCode login declined");
                    throw new ZaloApiLoginQRDeclined();
                }
                return;
            }
            else if (confirmResult.error_code != 0) {
                throw new ZaloApiError(`An error has occurred.\nResponse: ${JSON.stringify(confirmResult, null, 2)}`);
            }
            const checkSessionResult = await checkSession(ctx);
            if (!checkSessionResult)
                throw new ZaloApiError("Cannot get session, login failed");
            logger(ctx).info("Successfully logged into the account", scanResult.data.display_name);
            const userInfo = await getUserInfo(ctx);
            if (!userInfo || !userInfo.data)
                throw new ZaloApiError("Can't get account info");
            if (!userInfo.data.logged)
                throw new ZaloApiError("Can't login");
            resolve({
                cookies: ctx.cookie.toJSON().cookies,
                userInfo: userInfo.data.info,
            });
        }
        catch (error) {
            cleanUp();
            reject(error);
        }
    });
}
