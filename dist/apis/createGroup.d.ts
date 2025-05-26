import type { AttachmentSource } from "../models/Attachment.js";
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
export declare const createGroupFactory: (ctx: import("../context.js").ContextBase, api: import("../zalo.js").API) => (options: CreateGroupOptions) => Promise<CreateGroupResponse>;
