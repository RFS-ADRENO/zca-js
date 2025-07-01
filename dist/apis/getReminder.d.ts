export type GetReminderResponse = {
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
    repeatInfo: null;
    repeatData: any[];
    createTime: number;
    repeat: number;
    startTime: number;
    id: string;
};
export declare const getReminderFactory: (ctx: import("../context.js").ContextBase, api: import("../zalo.js").API) => (eventId: string, groupId: string) => Promise<GetReminderResponse>;
