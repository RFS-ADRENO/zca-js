export type GetReminderEventResponse = {
    rejectMember: string[];
    acceptMember: string[];
};
export declare const getReminderEventFactory: (ctx: import("../context.js").ContextBase, api: import("../zalo.js").API) => (eventId: string) => Promise<GetReminderEventResponse>;
