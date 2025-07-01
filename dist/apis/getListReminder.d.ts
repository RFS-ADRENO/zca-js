import { ThreadType } from "../models/index.js";
export type ListReminderParams = {
    /**
     * Board type for group listing reminders:
     * - 1: Default board type
     * - 2: Second board type
     * - 3: Third board type
     */
    board_type?: number;
    page?: number;
    count?: number;
};
export type GetListReminderResponse = {
    editorId: string;
    emoji: string;
    color: number;
    groupId: string;
    creatorId: string;
    editTime: number;
    eventType: number;
    responseMem: {
        rejectMember: number;
        myResp: number;
        acceptMember: number;
    };
    params: {
        title: string;
        setTitle: boolean;
    };
    type: number;
    duration: number;
    repeatInfo: {
        list_ts: any[];
    };
    repeatData: any[];
    createTime: number;
    repeat: number;
    startTime: number;
    id: string;
}[];
export declare const getListReminderFactory: (ctx: import("../context.js").ContextBase, api: import("../zalo.js").API) => (params: ListReminderParams, threadId: string, type?: ThreadType) => Promise<GetListReminderResponse>;
