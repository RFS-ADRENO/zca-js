'use strict';

var ZaloApiError = require('../Errors/ZaloApiError.cjs');
var Enum = require('../models/Enum.cjs');
require('../models/FriendEvent.cjs');
require('../models/GroupEvent.cjs');
require('../models/Reaction.cjs');
var utils = require('../utils.cjs');

exports.ReportReason = void 0;
(function (ReportReason) {
    ReportReason[ReportReason["Sensitive"] = 1] = "Sensitive";
    ReportReason[ReportReason["Annoy"] = 2] = "Annoy";
    ReportReason[ReportReason["Fraud"] = 3] = "Fraud";
    ReportReason[ReportReason["Other"] = 0] = "Other";
})(exports.ReportReason || (exports.ReportReason = {}));
const sendReportFactory = utils.apiFactory()((api, ctx, utils$1) => {
    const serviceURL = {
        [Enum.ThreadType.User]: utils$1.makeURL(`${api.zpwServiceMap.profile[0]}/api/report/abuse-v2`),
        [Enum.ThreadType.Group]: utils$1.makeURL(`${api.zpwServiceMap.profile[0]}/api/social/profile/reportabuse`),
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
    return async function sendReport(options, threadId, type = Enum.ThreadType.User) {
        const params = type == Enum.ThreadType.User
            ? {
                idTo: threadId,
                objId: "person.profile",
                reason: options.reason.toString(),
                content: options.reason == exports.ReportReason.Other ? options.content : undefined,
            }
            : {
                uidTo: threadId,
                type: 14,
                reason: options.reason,
                content: options.reason == exports.ReportReason.Other ? options.content : "",
                imei: ctx.imei,
            };
        utils.removeUndefinedKeys(params);
        const encryptedParams = utils$1.encodeAES(JSON.stringify(params));
        if (!encryptedParams)
            throw new ZaloApiError.ZaloApiError("Failed to encrypt params");
        const response = await utils$1.request(serviceURL[type], {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });
        return utils$1.resolve(response);
    };
});

exports.sendReportFactory = sendReportFactory;
