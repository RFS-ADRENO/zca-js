export type UpdateGroupSettingsOptions = {
    /**
     * Disallow group members to change the group name and avatar
     */
    blockName?: boolean;
    /**
     * Highlight messages from owner/admins
     */
    signAdminMsg?: boolean;
    /**
     * Don't pin messages, notes, and polls to the top of a conversation
     */
    setTopicOnly?: boolean;
    /**
     * Allow new members to read most recent messages
     */
    enableMsgHistory?: boolean;
    /**
     * Membership approval
     */
    joinAppr?: boolean;
    /**
     * Disallow group members to create notes & reminders
     */
    lockCreatePost?: boolean;
    /**
     * Disallow group members to create polls
     */
    lockCreatePoll?: boolean;
    /**
     * Disallow group members to send messages
     */
    lockSendMsg?: boolean;
    /**
     * Disallow group members to view full member list (community only)
     */
    lockViewMember?: boolean;
};
export type UpdateGroupSettingsResponse = "";
export declare const updateGroupSettingsFactory: (ctx: import("../context.js").ContextBase, api: import("../apis.js").API) => (options: UpdateGroupSettingsOptions, groupId: string) => Promise<"">;
