import { ThreadType } from "../models/index.js";
export type EditReminderOptions = {
    title: string;
    topicId: string;
    creatorUid: string;
    color?: string;
    emoji?: string;
    pinAct?: boolean;
    startTime?: number;
    duration?: number;
    /**
     * Repeat mode for the reminder:
     * - 0: No repeat
     * - 1: Daily repeat
     * - 2: Weekly repeat
     * - 3: Monthly repeat
     */
    repeat?: number;
};
export type UserReminderResponse = {
    creatorUid: string;
    toUid: string;
    emoji: string;
    color: number;
    reminderId: string;
    createTime: number;
    repeat: number;
    startTime: number;
    editTime: number;
    endTime: number;
    params: {
        title: string;
        setTitle: boolean;
    };
    type: number;
};
export type GroupReminderResponse = {
    editorId: string;
    emoji: string;
    color: number;
    groupId: string;
    creatorId: string;
    editTime: number;
    eventType: number;
    params: {
        title: string;
        setTitle: boolean;
    };
    type: number;
    duration: number;
    repeatInfo: null;
    repeatData: any[];
    createTime: number;
    repeat: number;
    startTime: number;
    id: string;
};
export type EditReminderResponse = UserReminderResponse | GroupReminderResponse;
export declare const editReminderFactory: (ctx: import("../context.js").ContextBase, api: import("../zalo.js").API) => (options: EditReminderOptions, threadId: string, type?: ThreadType) => Promise<EditReminderResponse>;
