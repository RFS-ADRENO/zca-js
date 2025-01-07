import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { MessageType } from "../models/Message.js";
import { apiFactory, removeUndefinedKeys } from "../utils.js";

export type SendReportResponse = {
    reportId: string;
};

export enum ReportReason {
    Sensitive = 1,
    Annoy = 2,
    Fraud = 3,
    Other = 0,
}

export type ReportOptions =
    | {
          reason: ReportReason.Other;
          content: string;
      }
    | {
          reason: Exclude<ReportReason, ReportReason.Other>;
      };

export const sendReportFactory = apiFactory<SendReportResponse>()((api, ctx, utils) => {
    const serviceURL = {
        [MessageType.DirectMessage]: utils.makeURL(`${api.zpwServiceMap.profile[0]}/api/report/abuse-v2`),
        [MessageType.GroupMessage]: utils.makeURL(`${api.zpwServiceMap.profile[0]}/api/social/profile/reportabuse`),
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
        options: ReportOptions,
        threadId: string,
        type: MessageType = MessageType.DirectMessage,
    ) {
        const params =
            type == MessageType.DirectMessage
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
