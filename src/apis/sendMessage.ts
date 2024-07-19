import { appContext } from "../context.js";
import { decodeAES, encodeAES, updateCookie } from "../utils.js";
import { Message } from "../models/Message.js";

export function sendMessageFactory(serviceURL: string) {
    return async function sendMessage(message: string, recipientId: string, quote?: Message) {
        if (!appContext.secretKey) throw new Error("Secret key is not available");
        if (!appContext.imei) throw new Error("IMEI is not available");
        if (!appContext.cookie) throw new Error("Cookie is not available");
        if (!appContext.userAgent) throw new Error("User agent is not available");

        if (quote && !(quote instanceof Message)) throw new Error("Invalid quote message");

        const params = quote
            ? {
                  toid: recipientId,
                  message: message,
                  clientId: Date.now(),
                  qmsgOwner: quote.owner,
                  qmsgId: quote.id,
                  qmsgCliId: quote.clientId,
                  qmsgType: quote.type,
                  qmsgTs: quote.ts,
                  qmsg: quote.msg,
                  imei: appContext.imei,
                  qmsgTTL: quote.ttl,
                  ttl: 0,
              }
            : {
                  message: message,
                  clientId: Date.now(),
                  imei: appContext.imei,
                  ttl: 0,
                  toid: recipientId,
              };

        const encryptedParams = encodeAES(appContext.secretKey, JSON.stringify(params));
        if (!encryptedParams) throw new Error("Failed to encrypt message");
        const finalServiceUrl = new URL(serviceURL);
        finalServiceUrl.pathname = finalServiceUrl.pathname + "/" + (quote ? "quote" : "sms");

        const response = await fetch(finalServiceUrl.toString(), {
            method: "POST",
            headers: {
                Accept: "application/json, text/plain, */*",
                "Accept-Encoding": "gzip, deflate, br, zstd",
                "Accept-Language": "en-US,en;q=0.9",
                "Content-Type": "application/x-www-form-urlencoded",
                Cookie: appContext.cookie,
                Origin: "https://chat.zalo.me",
                Referer: "https://chat.zalo.me/",
                "User-Agent": appContext.userAgent,
            },
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });

        if (!response.ok) throw new Error("Failed to send message: " + response.statusText);
        if (response.headers.has("set-cookie")) {
            const newCookie = updateCookie(appContext.cookie, response.headers.get("set-cookie")!);
            if (newCookie) appContext.cookie = newCookie;
        }


        return decodeAES(appContext.secretKey, (await response.json()).data);
    };
}
