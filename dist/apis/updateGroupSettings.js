import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";
export const updateGroupSettingsFactory = apiFactory()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.group[0]}/api/group/setting/update`);
    /**
     * Update group settings
     *
     * @param options Options
     * @param groupId Group ID
     *
     * @note Zalo might throw an error with code 166 if you don't have enough permissions to change the settings.
     *
     * @throws {ZaloApiError}
     */
    return async function updateGroupSettings(options, groupId) {
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
        if (!encryptedParams)
            throw new ZaloApiError("Failed to encrypt params");
        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
            method: "GET",
        });
        return utils.resolve(response);
    };
});
