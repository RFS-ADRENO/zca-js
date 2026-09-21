import { type SerializedCookie, type SerializedCookieJar } from "tough-cookie";
import type { ContextBase } from "../context.js";
export declare enum LoginQRCallbackEventType {
    QRCodeGenerated = 0,
    QRCodeExpired = 1,
    QRCodeScanned = 2,
    QRCodeDeclined = 3,
    GotLoginInfo = 4
}
export type LoginQRCallbackEvent = {
    type: LoginQRCallbackEventType.QRCodeGenerated;
    data: {
        code: string;
        image: string;
        options: {
            enabledCheckOCR: boolean;
            enabledMultiLayer: boolean;
        };
        token: string;
    };
    actions: {
        saveToFile: (qrPath?: string) => Promise<unknown>;
        retry: () => unknown;
        abort: () => unknown;
    };
} | {
    type: LoginQRCallbackEventType.QRCodeExpired;
    data: null;
    actions: {
        retry: () => unknown;
        abort: () => unknown;
    };
} | {
    type: LoginQRCallbackEventType.QRCodeScanned;
    data: {
        avatar: string;
        display_name: string;
    };
    actions: {
        retry: () => unknown;
        abort: () => unknown;
    };
} | {
    type: LoginQRCallbackEventType.QRCodeDeclined;
    data: {
        code: string;
    };
    actions: {
        retry: () => unknown;
        abort: () => unknown;
    };
} | {
    type: LoginQRCallbackEventType.GotLoginInfo;
    data: {
        cookie: SerializedCookie[];
        imei: string;
        userAgent: string;
    };
    actions: null;
};
export type LoginQRCallback = (event: LoginQRCallbackEvent) => unknown;
export declare function loginQR(ctx: ContextBase, options: {
    userAgent: string;
    qrPath?: string;
}, callback?: LoginQRCallback): Promise<{
    userInfo: {
        name: string;
        avatar: string;
    };
    cookies: SerializedCookieJar["cookies"];
} | null>;
