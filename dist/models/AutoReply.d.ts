export type AutoReplyItem = {
    id: number;
    weight: number;
    enable: boolean;
    modifiedTime: number;
    startTime: number;
    endTime: number;
    content: string;
    scope: AutoReplyScope;
    uids: string[] | null;
    ownerId: number;
    recurrence: string[];
    createdTime: number;
};
export declare enum AutoReplyScope {
    Everyone = 0,
    Stranger = 1,
    SpecificFriends = 2,
    FriendsExcept = 3
}
