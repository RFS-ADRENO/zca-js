import { ZaloApiError } from "../Errors/ZaloApiError.js";
import type { AttachmentSource } from "../models/Attachment.js";
import { apiFactory } from "../utils.js";

export type CreateGroupResponse = {
    groupType: number;
    sucessMembers: string[];
    groupId: string;
    errorMembers: string[];
    error_data: Record<string, any>;
};

export type CreateGroupOptions = {
    /**
     * Group name
     */
    name?: string;
    /**
     * List of member IDs to add to the group
     */
    members: string[];
    /**
     * Avatar source, can be a file path or an Attachment object
     */
    avatarSource?: AttachmentSource;
    /**
     * Path to the avatar image file
     * @deprecated Use `avatarSource` instead
     */
    avatarPath?: string;
};

export const createGroupFactory = apiFactory<CreateGroupResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.group[0]}/api/group/create/v2`);

    /**
     * Create a new group
     *
     * @param options Group options
     *
     * @throws ZaloApiError
     */
    return async function createGroup(options: CreateGroupOptions) {
        if (options.members.length == 0) throw new ZaloApiError("Group must have at least one member");

        const params: any = {
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
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt message");

        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
            method: "POST",
        });

        const data = await utils.resolve(response);
        options.avatarSource = options.avatarSource || options.avatarPath;
        if (options.avatarSource) await api.changeGroupAvatar(options.avatarSource, data.groupId).catch(console.error);

        return data;
    };
});
