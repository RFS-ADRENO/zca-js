export type UpdateSettingsResponse = {};
export type UpdateSettingsType = "view_birthday" | "online_status" | "seen_status" | "receive_message" | "accept_call" | "phone_search" | "find_me_via_qr" | "common_group" | "find_me_via_contact" | "recommend_friend" | "archive_chat" | "quick_msg";
export declare const updateSettingsFactory: (ctx: import("../context.js").ContextBase, api: import("../zalo.js").API) => (type: UpdateSettingsType, status: number) => Promise<UpdateSettingsResponse>;
