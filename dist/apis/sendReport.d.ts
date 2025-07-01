import { ThreadType } from "../models/index.js";
export declare enum ReportReason {
    Sensitive = 1,
    Annoy = 2,
    Fraud = 3,
    Other = 0
}
export type SendReportOptions = {
    reason: ReportReason.Other;
    content: string;
} | {
    reason: Exclude<ReportReason, ReportReason.Other>;
};
export type SendReportResponse = {
    reportId: string;
};
export declare const sendReportFactory: (ctx: import("../context.js").ContextBase, api: import("../zalo.js").API) => (options: SendReportOptions, threadId: string, type?: ThreadType) => Promise<SendReportResponse>;
