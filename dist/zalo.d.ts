import { type LoginQRCallback } from "./apis/loginQR.js";
import { type Options } from "./context.js";
import toughCookie from "tough-cookie";
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
    cookie: Cookie[] | toughCookie.SerializedCookie[] | {
        url: string;
        cookies: Cookie[];
    };
    userAgent: string;
    language?: string;
};
export declare class Zalo {
    private options;
    private enableEncryptParam;
    constructor(options?: Partial<Options>);
    private parseCookies;
    private validateParams;
    login(credentials: Credentials): Promise<API>;
    private loginCookie;
    loginQR(options?: {
        userAgent?: string;
        language?: string;
        qrPath?: string;
    }, callback?: LoginQRCallback): Promise<API>;
}
export { API };
