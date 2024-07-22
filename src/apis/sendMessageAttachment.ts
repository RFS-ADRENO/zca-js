import { appContext } from "../context.js";
import { API } from "../index.js";
import { Zalo } from "../index.js";
import { decodeAES, encodeAES, request } from "../utils.js";

export function sendMessageAttachmentFactory(serviceURL: string, api: API) {
    function getGroupLayoutId() {
        return new class {
            _lastClientId: number;
            getTimeServer: () => number
            constructor() {
                this._lastClientId = Date.now(),
                    this.getTimeServer = () => Date.now()
            }
            next() {
                let e = this.getTimeServer();
                return e <= this._lastClientId && (this._lastClientId++,
                    e = this._lastClientId),
                    this._lastClientId = e,
                    e
            }
        }
    }

    return async function sendMessageAttachment(message: string = "", filePaths: string[], type: "group" | "user", toid: string) {
        if (!appContext.secretKey) throw new Error("Secret key is not available");
        if (!appContext.imei) throw new Error("IMEI is not available");
        if (!appContext.cookie) throw new Error("Cookie is not available");
        if (!appContext.userAgent) throw new Error("User agent is not available");

        let uploadAttachment = await api.uploadAttachment(filePaths, type, toid);

        let paramsData = [], indexInGroupLayout = uploadAttachment.length - 1;

        let grid = getGroupLayoutId().next();

        for (const attachment of uploadAttachment) {
            if (filePaths.length === 1) {
                console.log("Send single file")
                paramsData.push({
                    fileData: attachment.fileData,
                    param: {
                        photoId: attachment.response.data.photoId,
                        clientId: Date.now(),
                        desc: message,
                        width: attachment.fileData.data.width,
                        height: attachment.fileData.data.height,
                        toid: toid,
                        rawUrl: attachment.response.data.normalUrl,
                        hdUrl: attachment.response.data.hdUrl,
                        thumbUrl: attachment.response.data.thumbUrl,
                        normalUrl: attachment.response.data.normalUrl,
                        thumbSize: "9815",
                        fileSize: String(attachment.fileData.data.totalSize),
                        hdSize: String(attachment.fileData.data.totalSize),
                        zsource: -1,
                        ttl: 0,
                        imei: appContext.imei
                    }
                })
            } else {
                console.log("Send multiple files")
                paramsData.push({
                    fileData: attachment.fileData,
                    param: {
                        photoId: attachment.response.data.photoId,
                        clientId: Date.now(),
                        desc: message,
                        width: attachment.fileData.data.width,
                        height: attachment.fileData.data.height,
                        groupLayoutId: grid,
                        isGroupLayout: 1,
                        idInGroup: indexInGroupLayout--,
                        totalItemInGroup: filePaths.length,
                        toid: toid,
                        rawUrl: attachment.response.data.normalUrl,
                        hdUrl: attachment.response.data.hdUrl,
                        thumbUrl: attachment.response.data.thumbUrl,
                        normalUrl: attachment.response.data.normalUrl,
                        thumbSize: "9815",
                        fileSize: String(attachment.fileData.data.totalSize),
                        hdSize: String(attachment.fileData.data.totalSize),
                        zsource: -1,
                        ttl: 0,
                        imei: appContext.imei
                    }
                })
            }

            await new Promise(resolve => setTimeout(resolve, 1));
        }

        let requests = [];
        let results: any = [];

        let url = `${serviceURL}/${type == "group" ? "group" : "message"}/`
        let queryString = `zpw_ver=${Zalo.API_VERSION}&zpw_type=${Zalo.API_TYPE}&type=${type == "group" ? "11" : "2"}`

        for (const param of paramsData) {
            const encryptedParams = encodeAES(appContext.secretKey, JSON.stringify(param.param));
            if (!encryptedParams) throw new Error("Failed to encrypt message");
            let urlType = `${param.fileData.fileType == "image" ? `photo_original/upload?` : null}`;
            requests.push(request(
                url + urlType + queryString,
                {
                    method: "POST",
                    body: new URLSearchParams({
                        params: encryptedParams,
                    }),
                }
            ).then(async (response) => {
                if (!response.ok) throw new Error("Failed to send message: " + response.statusText);

                let resDecode = decodeAES(appContext.secretKey!, (await response.json()).data);
                if (!resDecode) throw new Error("Failed to decode message");
                results.push(JSON.parse(resDecode));
            }))
        }

        await Promise.all(requests);

        return results;
    }
}