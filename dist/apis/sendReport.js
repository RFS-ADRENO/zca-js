import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { ThreadType } from "../models/index.js";
import { apiFactory, removeUndefinedKeys } from "../utils.js";
export var ReportReason;
(function (ReportReason) {
    ReportReason[ReportReason["Sensitive"] = 1] = "Sensitive";
    ReportReason[ReportReason["Annoy"] = 2] = "Annoy";
    ReportReason[ReportReason["Fraud"] = 3] = "Fraud";
    ReportReason[ReportReason["Other"] = 0] = "Other";
})(ReportReason || (ReportReason = {}));
export const sendReportFactory = apiFactory()((api, ctx, utils) => {
    const serviceURL = {
        [ThreadType.User]: utils.makeURL(`${api.zpwServiceMap.profile[0]}/api/report/abuse-v2`),
        [ThreadType.Group]: utils.makeURL(`${api.zpwServiceMap.profile[0]}/api/social/profile/reportabuse`),
    };
    /**
     * Send report to Zalo
     *
     * @param options Report options
     * @param threadId The threadID to report
     * @param type Thread type, default direct
     *
     * @throws ZaloApiError
     *
     */
    return async function sendReport(options, threadId, type = ThreadType.User) {
        const params = type == ThreadType.User
            ? {
                idTo: threadId,
                objId: "person.profile",
                reason: options.reason.toString(),
                content: options.reason == ReportReason.Other ? options.content : undefined,
            }
            : {
                uidTo: threadId,
                type: 14,
                reason: options.reason,
                content: options.reason == ReportReason.Other ? options.content : "",
                imei: ctx.imei,
            };
        removeUndefinedKeys(params);
        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams)
            throw new ZaloApiError("Failed to encrypt params");
        const response = await utils.request(serviceURL[type], {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });
        return utils.resolve(response);
    };
});
