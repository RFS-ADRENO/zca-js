export declare enum ReminderRepeatMode {
    None = 0,
    Daily = 1,
    Weekly = 2,
    Monthly = 3
}
export type ReminderUser = {
    creatorUid: string;
    toUid: string;
    emoji: string;
    color: number;
    reminderId: string;
    createTime: number;
    repeat: ReminderRepeatMode;
    startTime: number;
    editTime: number;
    endTime: number;
    params: {
        title: string;
        setTitle: boolean;
    };
    type: number;
};
export type ReminderGroup = {
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
        setTitle?: boolean;
    };
    type: number;
    duration: number;
    repeatInfo: {
        list_ts: unknown[];
    } | null;
    repeatData: unknown[];
    createTime: number;
    repeat: ReminderRepeatMode;
    startTime: number;
    id: string;
};
