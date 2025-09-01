export enum ReminderRepeatMode {
    None = 0,
    Daily = 1,
    Weekly = 2,
    Monthly = 3,
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
    id: string;
    type: number;
    color: number;
    emoji: string;
    startTime: number;
    duration: number;
    params: {
        title: string;
        setTitle?: boolean;
    };
    creatorId: string;
    editorId: string;
    createTime: number;
    editTime: number;
    repeat: ReminderRepeatMode;
};
