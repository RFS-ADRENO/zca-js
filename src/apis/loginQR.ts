import { CookieJar, SerializedCookieJar } from "tough-cookie";

import { writeFile } from "node:fs/promises";
import type { ContextBase } from "../context.js";
import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { logger, request } from "../utils.js";

async function loadLoginPage(ctx: ContextBase) {
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

    return match?.[1];
}

async function getLoginInfo(ctx: ContextBase, version: string) {
    const form = new URLSearchParams();
    form.append("continue", "https://chat.zalo.me/");
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
            Referer: "https://id.zalo.me/account?continue=https%3A%2F%2Fchat.zalo.me%2F",
            "Referrer-Policy": "strict-origin-when-cross-origin",
        },
        body: form,
        method: "POST",
    })
        .then((res) => res.json())
        .catch(logger(ctx).error);
}

async function verifyClient(ctx: ContextBase, version: string) {
    const form = new URLSearchParams();
    form.append("type", "device");
    form.append("continue", "https://chat.zalo.me/");
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
            Referer: "https://id.zalo.me/account?continue=https%3A%2F%2Fchat.zalo.me%2F",
            "Referrer-Policy": "strict-origin-when-cross-origin",
        },
        body: form,
        method: "POST",
    })
        .then((res) => res.json())
        .catch(logger(ctx).error);
}

async function generate(
    ctx: ContextBase,
    version: string,
): Promise<
    | {
          data: {
              code: string;
              image: string;
              options: {
                  enabledCheckOCR: boolean;
                  enabledMultiLayer: boolean;
              };
          };
          error_code: number;
          error_message: string;
      }
    | undefined
> {
    const form = new URLSearchParams();
    form.append("continue", "https://chat.zalo.me/");
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
            Referer: "https://id.zalo.me/account?continue=https%3A%2F%2Fchat.zalo.me%2F",
            "Referrer-Policy": "strict-origin-when-cross-origin",
        },
        body: form,
        method: "POST",
    })
        .then((res) => res.json())
        .catch(logger(ctx).error);
}

async function saveQRCodeToFile(filepath: string, imageData: string) {
    await writeFile(filepath, imageData, "base64");
}

async function waitingScan(
    ctx: ContextBase,
    version: string,
    code: string,
    signal: AbortSignal,
): Promise<
    | {
          data: {
              avatar: string;
              display_name: string;
          } | null;
          error_code: number;
          error_message: string;
      }
    | undefined
> {
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
            if (!signal.aborted) logger(ctx).error(e);
        });
}

async function waitingConfirm(
    ctx: ContextBase,
    version: string,
    code: string,
    signal: AbortSignal,
): Promise<
    | {
          data: null;
          error_code: number;
          error_message: string;
      }
    | undefined
> {
    const form = new URLSearchParams();
    form.append("code", code);
    form.append("gToken", "");
    form.append("gAction", "CONFIRM_QR");
    form.append("continue", "https://chat.zalo.me/");
    form.append("v", version);

    logger(ctx).info("Vui lòng xác nhận trên điện thoại của bạn");

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
            if (!signal.aborted) logger(ctx).error(e);
        });
}

async function checkSession(ctx: ContextBase) {
    return await request(
        ctx,
        "https://id.zalo.me/account/checksession?continue=https%3A%2F%2Fchat.zalo.me%2Findex.html",
        {
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
        },
    ).catch(logger(ctx).error);
}

async function getUserInfo(ctx: ContextBase): Promise<
    | {
          data: {
              logged: boolean;
              session_chat_valid: boolean;
              info: {
                  name: string;
                  avatar: string;
              };
          } | null;
          error_code: number;
          error_message: string;
      }
    | undefined
> {
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

export async function loginQR(
    ctx: ContextBase,
    options: { userAgent: string; qrPath?: string },
    callback?: (qrPath: string) => any,
) {
    ctx.cookie = new CookieJar();
    ctx.userAgent = options.userAgent;

    return new Promise<{
        userInfo: {
            name: string;
            avatar: string;
        };
        cookies: SerializedCookieJar["cookies"];
    } | null>(async (resolve, reject) => {
        console.log();
        const loginVersion = await loadLoginPage(ctx);
        if (!loginVersion) return reject(new ZaloApiError("Không thể lấy phiên bản API đăng nhập"));
        logger(ctx).info("Phiên bản API đăng nhập:", loginVersion);

        await getLoginInfo(ctx, loginVersion);
        await verifyClient(ctx, loginVersion);
        const qrData = await generate(ctx, loginVersion);
        if (!qrData) throw new ZaloApiError("Không thể khởi tạo QRCode");

        const controller = new AbortController();

        const timeout = setTimeout(() => {
            controller.abort();

            logger(ctx).info("QR hết hạn, tiến hành lấy mới");
            resolve(loginQR(ctx, options));
        }, 100_000);

        const qrPath = options.qrPath ?? "qr.png";
        await saveQRCodeToFile(qrPath, qrData.data.image.replace(/^data:image\/png;base64,/, ""));
        callback?.(qrPath);
        logger(ctx).info("Quét mã QR tại đường dẫn", `'${qrPath}'`, "để tiến hành đăng nhập");

        const scanResult = await waitingScan(ctx, loginVersion, qrData.data.code, controller.signal);
        if (!scanResult || !scanResult.data) return resolve(null);

        const confirmResult = await waitingConfirm(ctx, loginVersion, qrData.data.code, controller.signal);
        if (!confirmResult) return resolve(null);

        const checkSessionResult = await checkSession(ctx);
        if (!checkSessionResult) return resolve(null);

        if (confirmResult.error_code == 0) {
            logger(ctx).info("Login thành công vào tài khoản", scanResult.data.display_name);
        } else if (confirmResult.error_code == -13) {
            logger(ctx).info("Bạn đã từ chối đăng nhập bằng mã QR");
        } else {
            logger(ctx).info("Đã có lỗi xảy ra.", confirmResult);
        }

        const userInfo = await getUserInfo(ctx);
        if (!userInfo || !userInfo.data) throw new ZaloApiError("Không thể lấy thông tin tài khoản");
        if (!userInfo.data.logged) throw new ZaloApiError("Không thể đăng nhập");

        clearTimeout(timeout);
        resolve({
            cookies: ctx.cookie!.toJSON()!.cookies,
            userInfo: userInfo.data.info,
        });
    });
}
