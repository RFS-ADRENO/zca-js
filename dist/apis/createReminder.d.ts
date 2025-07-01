import { ThreadType } from "../models/index.js";
export type CreateReminderOptions = {
    title: string;
    color?: string;
    emoji?: string;
    pinAct?: boolean;
    creatorUid?: string;
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
export type CreateReminderResponse = {
    editorId?: string;
    emoji: string;
    color: number;
    groupId?: string;
    creatorId?: string;
    creatorUid?: string;
    toUid?: string;
    editTime: number;
    eventType?: number;
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
    id?: string;
    reminderId?: string;
    endTime: number;
};
export declare const createReminderFactory: (ctx: import("../context.js").ContextBase, api: import("../zalo.js").API) => (options: CreateReminderOptions, threadId: string, type?: ThreadType) => Promise<CreateReminderResponse>;
