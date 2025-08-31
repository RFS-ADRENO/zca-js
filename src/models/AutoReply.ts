export type AutoReply = {
    id: number;
    weight: number;
    enable: boolean;
    modifiedTime: number;
    startTime: number;
    endTime: number;
    content: string;
    scope: number;
    uids: string[] | null;
    ownerId: number;
    recurrence: string[];
    createdTime: number;
};
