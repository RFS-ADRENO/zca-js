import { AvatarSize, type UserBasic } from "../models/index.js";
export type GetMultiUsersByPhonesResponse = {
    [phoneNumber: string]: UserBasic;
};
export declare const getMultiUsersByPhonesFactory: (ctx: import("../context.js").ContextBase, api: import("../apis.js").API) => (phoneNumbers: string | string[], avatarSize?: AvatarSize) => Promise<GetMultiUsersByPhonesResponse>;
