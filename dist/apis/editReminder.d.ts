import type { ReminderRepeatMode, ReminderGroup, ReminderUser } from "../models/index.js";
import { ThreadType } from "../models/index.js";
export type EditReminderOptions = {
    title: string;
    topicId: string;
    emoji?: string;
    startTime?: number;
    repeat?: ReminderRepeatMode;
};
export type EditReminderUser = ReminderUser;
export type EditReminderGroup = Omit<ReminderGroup, "responseMem">;
export type EditReminderResponse = EditReminderUser | EditReminderGroup;
export declare const editReminderFactory: (ctx: import("../context.js").ContextBase, api: import("../apis.js").API) => (options: EditReminderOptions, threadId: string, type?: ThreadType) => Promise<EditReminderResponse>;
