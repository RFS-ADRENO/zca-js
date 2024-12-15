import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory, encodeAES, makeURL, request } from "../utils.js";

type Message =
    | {
          text: string;
      }
    | string;

export type SendReportResponse = {
    reportId: string;
};

export const sendReportFactory = apiFactory<SendReportResponse>()((api, ctx, resolve) => {
    const serviceURL = makeURL(`${api.zpwServiceMap.profile[0]}/api/report/abuse-v2`);

    /**
     * Send report to Zalo
     *
     * @param message The message to report
     * @param threadId The threadID to report
     * @param reason Reason for report (1 = Nội dung nhạy cảm, 2 = Làm phiền, 3 = Lừa đảo, 0 = custom)
     *
     * @throws ZaloApiError
     *
     */
    return async function sendReport(message: Message, threadId: string, reason?: string | number) {
        const objId = "person.profile";

        const params: any = {
            idTo: threadId,
            objId: objId,
            reason: reason,
        };

        params.reason = reason !== undefined && reason !== null ? reason : Math.floor(Math.random() * 3) + 1;
        if (message && (reason === 0 || reason === "0")) {
            params.content = typeof message === "string" ? message : message.text;
        } else {
            params.content = "";
        }

        const encryptedParams = encodeAES(ctx.secretKey, JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await request(serviceURL, {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });

        return resolve(response);
    };
});
