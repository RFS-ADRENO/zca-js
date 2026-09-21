import type { UserSetting } from "../models/index.js";
export type GetSettingsResponse = UserSetting;
export declare const getSettingsFactory: (ctx: import("../context.js").ContextBase, api: import("../apis.js").API) => () => Promise<UserSetting>;
