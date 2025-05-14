export type SetSettingsAccountResponse = {};
export type SettingType = "view_birthday" | "online_status" | "seen_status" | "receive_message" | "accept_call" | "phone_search" | "find_me_via_qr" | "common_group" | "find_me_via_contact" | "recommend_friend";
export declare const setSettingsAccountFactory: (ctx: import("../context.js").ContextBase, api: import("../zalo.js").API) => (type: SettingType, status: number) => Promise<SetSettingsAccountResponse>;
