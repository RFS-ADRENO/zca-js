export type GroupMemberProfile = {
    displayName: string;
    zaloName: string;
    avatar: string;
    accountStatus: number;
    type: number;
    lastUpdateTime: number;
    globalId: string;
    id: string;
};
export type GetGroupMembersInfoResponse = {
    profiles: {
        [memberId: string]: GroupMemberProfile;
    };
    unchangeds_profile: unknown[];
};
export declare const getGroupMembersInfoFactory: (ctx: import("../context.js").ContextBase, api: import("../apis.js").API) => (memberId: string | string[]) => Promise<GetGroupMembersInfoResponse>;
