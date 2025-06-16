import type { AttachmentSource } from "../models/Attachment.js";
export type ChangeAccountAvatarResponse = "";
export declare const changeAccountAvatarFactory: (ctx: import("../context.js").ContextBase, api: import("../zalo.js").API) => (userId: string, source: AttachmentSource) => Promise<"">;
