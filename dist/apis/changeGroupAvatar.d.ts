import type { AttachmentSource } from "../models/Attachment.js";
export type ChangeGroupAvatarResponse = "";
export declare const changeGroupAvatarFactory: (ctx: import("../context.js").ContextBase, api: import("../zalo.js").API) => (avatarSource: AttachmentSource, groupId: string) => Promise<"">;
