import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { ThreadType } from "../models/index.js";
import { apiFactory, removeUndefinedKeys } from "../utils.js";

export enum ReportReason {
    Sensitive = 1,
    Annoy = 2,
    Fraud = 3,
    Other = 0,
}

export type SendReportOptions =
    | {
          reason: ReportReason.Other;
          content: string;
      }
    | {
          reason: Exclude<ReportReason, ReportReason.Other>;
      };

export type SendReportResponse = {
    reportId: string;
};

export const sendReportFactory = apiFactory<SendReportResponse>()((api, ctx, utils) => {
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
    return async function sendReport(
        options: SendReportOptions,
        threadId: string,
        type: ThreadType = ThreadType.User,
    ) {
        const params =
            type == ThreadType.User
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
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(serviceURL[type], {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });

        return utils.resolve(response);
    };
});
