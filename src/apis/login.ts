import type { ContextBase } from "../context.js";
import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { decryptResp, getSignKey, logger, makeURL, ParamsEncryptor, request } from "../utils.js";

export async function login(ctx: ContextBase, encryptParams: boolean) {
    const encryptedParams = await getEncryptParam(ctx, encryptParams, "getlogininfo");

    try {
        const response = await request(
            ctx,
            makeURL(ctx, "https://wpa.chat.zalo.me/api/login/getLoginInfo", {
                ...encryptedParams.params,
                nretry: 0,
            }),
        );
        if (!response.ok) throw new ZaloApiError("Failed to fetch login info: " + response.statusText);
        const data = await response.json();

        if (encryptedParams.enk) {
            const decryptedData = decryptResp(encryptedParams.enk, data.data);
            return decryptedData != null && typeof decryptedData != "string" ? decryptedData : null;
        }

        return null;
    } catch (error) {
        logger(ctx).error("Login failed:", error);
        throw error;
    }
}

export type ServerInfoOptions = {
    /** `dr_config.supportMaintenance` from a previous server info response, -1 if unknown */
    spMtn?: number;
    /** `dr_config.bucketId` from a previous server info response, -1 if unknown */
    bkt?: number;
    /** Zalo Web sends the string "null" after login */
    floatMenuPos?: string;
    /** `viewerkey` from a previous getLoginInfo response, only sent before the session is established */
    viewerKey?: string;
};

export async function getServerInfo(ctx: ContextBase, options: ServerInfoOptions = {}) {
    const params: Record<string, string | number> = {
        imei: ctx.imei as string,
        type: ctx.API_TYPE,
        client_version: ctx.API_VERSION,
        computer_name: "Web",
        sp_mtn: options.spMtn ?? -1,
        bkt: options.bkt ?? -1,
    };
    if (options.floatMenuPos !== undefined) params.floatMenuPos = options.floatMenuPos;
    if (options.viewerKey) params.viewerKey = options.viewerKey;
    // the web client signs every param it sends
    params.signkey = getSignKey("getserverinfo", params);

    const response = await request(ctx, makeURL(ctx, "https://wpa.chat.zalo.me/api/login/getServerInfo", params, false));
    if (!response.ok) throw new ZaloApiError("Failed to fetch server info: " + response.statusText);
    const data = await response.json();

    if (data.data == null) throw new ZaloApiError("Failed to fetch server info: " + data.error_message);
    return data.data;
}

async function getEncryptParam(ctx: ContextBase, encryptParams: boolean, type: string) {
    const params = {} as Record<string, unknown>;
    const data = {
        computer_name: "Web",
        imei: ctx.imei!,
        language: ctx.language!,
        ts: Date.now(),
    };
    const encryptedData = await _encryptParam(ctx, data, encryptParams);

    if (encryptedData == null) Object.assign(params, data);
    else {
        const { encrypted_params, encrypted_data } = encryptedData;
        Object.assign(params, encrypted_params);
        params.params = encrypted_data;
    }

    params.type = ctx.API_TYPE;
    params.client_version = ctx.API_VERSION;
    params.signkey = getSignKey(type, params);

    return {
        params,
        enk: encryptedData ? encryptedData.enk : null,
    };
}

async function _encryptParam(ctx: ContextBase, data: Record<string, unknown>, encryptParams: boolean) {
    if (encryptParams) {
        const encryptor = new ParamsEncryptor({
            type: ctx.API_TYPE,
            imei: data.imei as string,
            firstLaunchTime: Date.now(),
        });
        try {
            const stringifiedData = JSON.stringify(data);
            const encryptedKey = encryptor.getEncryptKey();
            const encodedData = ParamsEncryptor.encodeAES(encryptedKey, stringifiedData, "base64", false);
            const params = encryptor.getParams();

            return params
                ? {
                      encrypted_data: encodedData,
                      encrypted_params: params,
                      enk: encryptedKey,
                  }
                : null;
        } catch (error) {
            throw new ZaloApiError("Failed to encrypt params: " + error);
        }
    }
    return null;
}
