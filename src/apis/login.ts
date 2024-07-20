import { appContext } from "../context.js";
import { Zalo } from "../index.js";
import { decryptResp, getSignKey, makeURL, ParamsEncryptor, request } from "../utils.js";

export async function login(encryptParams: boolean) {
    const encryptedParams = await getEncryptParam(
        appContext.imei!,
        appContext.language!,
        encryptParams
    );

    try {
        const response = await request(
            makeURL("https://wpa.chat.zalo.me/api/login/getLoginInfo", {
                ...encryptedParams.params,
                nretry: 0,
            })
        );
        if (!response.ok) throw new Error("Failed to fetch login info: " + response.statusText);
        const data = await response.json();

        if (encryptedParams.enk) {
            const decryptedData = decryptResp(encryptedParams.enk, data.data);
            return decryptedData != null && typeof decryptedData != "string" ? decryptedData : null;
        }

        return null;
    } catch (error) {
        console.error(error);
        throw new Error("Failed to fetch login info: " + error);
    }
}

async function getEncryptParam(imei: string, language: string, encryptParams: boolean) {
    const params = {} as Record<string, any>;
    const data = {
        computer_name: "Web",
        imei,
        language,
        ts: Date.now(),
    };
    const encryptedData = await _encryptParam(data, encryptParams);

    if (encryptedData == null) Object.assign(params, data);
    else {
        const { encrypted_params, encrypted_data } = encryptedData;
        Object.assign(params, encrypted_params);
        params.params = encrypted_data;
    }

    params.type = Zalo.API_TYPE;
    params.client_version = Zalo.API_VERSION;
    params.signkey = getSignKey("getlogininfo", params);

    return {
        params,
        enk: encryptedData ? encryptedData.enk : null,
    };
}

async function _encryptParam(data: Record<string, any>, encryptParams: boolean) {
    if (encryptParams) {
        const encryptor = new ParamsEncryptor({
            type: Zalo.API_TYPE,
            imei: data.imei,
            firstLaunchTime: Date.now(),
        });
        try {
            const stringifiedData = JSON.stringify(data);
            const encryptedKey = encryptor.getEncryptKey();
            const encodedData = ParamsEncryptor.encodeAES(
                encryptedKey,
                stringifiedData,
                "base64",
                false
            );
            const params = encryptor.getParams();

            return params
                ? {
                      encrypted_data: encodedData,
                      encrypted_params: params,
                      enk: encryptedKey,
                  }
                : null;
        } catch (error) {
            throw new Error("Failed to encrypt params: " + error);
        }
    }
    return null;
}
