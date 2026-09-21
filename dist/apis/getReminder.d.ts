import type { ReminderGroup } from "../models/index.js";
export type GetReminderResponse = ReminderGroup;
export declare const getReminderFactory: (ctx: import("../context.js").ContextBase, api: import("../apis.js").API) => (reminderId: string) => Promise<ReminderGroup>;
