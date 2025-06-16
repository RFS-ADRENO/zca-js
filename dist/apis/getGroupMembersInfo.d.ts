export type MemberProfile = {
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
        [memberId: string]: MemberProfile;
    };
    unchangeds_profile: any[];
};
export declare const getGroupMembersInfoFactory: (ctx: import("../context.js").ContextBase, api: import("../zalo.js").API) => (memberId: string | string[]) => Promise<GetGroupMembersInfoResponse>;
