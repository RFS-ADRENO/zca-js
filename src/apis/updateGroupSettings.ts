import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

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

    // bannFeature?: boolean; // not see in UI, not implemented
    // addMemberOnly?: boolean; // not see in UI, not implemented
    // dirtyMedia?: boolean; // not see in UI, not implemented
    // banDuration?: boolean | number; // not see in UI, not implemented
};

export type UpdateGroupSettingsResponse = "";

export const updateGroupSettingsFactory = apiFactory<UpdateGroupSettingsResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.group[0]}/api/group/setting/update`);

    /**
     * Update group settings
     *
     * @param options Options
     * @param groupId Group ID
     *
     * @note Zalo might throw an error with code 166 if you don't have enough permissions to change the settings.
     *
     * @throws ZaloApiError
     */
    return async function updateGroupSettings(options: UpdateGroupSettingsOptions, groupId: string) {
        const params = {
            blockName: options.blockName ? 1 : 0,
            signAdminMsg: options.signAdminMsg ? 1 : 0,

            // addMemberOnly: 0, // very tricky, any idea?

            setTopicOnly: options.setTopicOnly ? 1 : 0,
            enableMsgHistory: options.enableMsgHistory ? 1 : 0,
            joinAppr: options.joinAppr ? 1 : 0,
            lockCreatePost: options.lockCreatePost ? 1 : 0,
            lockCreatePoll: options.lockCreatePoll ? 1 : 0,
            lockSendMsg: options.lockSendMsg ? 1 : 0,
            lockViewMember: options.lockViewMember ? 1 : 0,

            // default values for not implemented options
            bannFeature: 0,
            dirtyMedia: 0,
            banDuration: 0,
            blocked_members: [],

            grid: groupId,
            imei: ctx.imei,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
