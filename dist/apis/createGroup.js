import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";
export const createGroupFactory = apiFactory()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.group[0]}/api/group/create/v2`);
    /**
     * Create a new group
     *
     * @param options Group options
     *
     * @throws ZaloApiError
     */
    return async function createGroup(options) {
        if (options.members.length == 0)
            throw new ZaloApiError("Group must have at least one member");
        const params = {
            clientId: Date.now(),
            gname: String(Date.now()),
            gdesc: null,
            members: options.members,
            membersTypes: options.members.map(() => -1),
            nameChanged: 0,
            createLink: 1,
            clientLang: ctx.language,
            imei: ctx.imei,
            zsource: 601,
        };
        if (options.name && options.name.length > 0) {
            params.gname = options.name;
            params.nameChanged = 1;
        }
        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams)
            throw new ZaloApiError("Failed to encrypt message");
        const response = await utils.request(serviceURL + `&params=${encodeURIComponent(encryptedParams)}`, {
            method: "POST",
        });
        const data = await utils.resolve(response);
        if (options.avatarPath)
            await api.changeGroupAvatar(data.groupId, options.avatarPath).catch(console.error);
        return data;
    };
});
