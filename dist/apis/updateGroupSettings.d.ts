export type UpdateGroupSettingsOptions = {
    blockName?: boolean;
    signAdminMsg?: boolean;
    addMemberOnly?: boolean;
    setTopicOnly?: boolean;
    enableMsgHistory?: boolean;
    joinAppr?: boolean;
    lockCreatePost?: boolean;
    lockCreatePoll?: boolean;
    lockSendMsg?: boolean;
    lockViewMember?: boolean;
    bannFeature?: boolean;
};
export type UpdateGroupSettingsResponse = {};
export declare const updateGroupSettingsFactory: (ctx: import("../context.js").ContextBase, api: import("../zalo.js").API) => (options: UpdateGroupSettingsOptions, groupId: string) => Promise<UpdateGroupSettingsResponse>;
