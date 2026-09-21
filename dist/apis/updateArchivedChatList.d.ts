import type { ThreadType } from "../models/Enum.js";
export type UpdateArchivedChatListTarget = {
    id: string;
    type: ThreadType;
};
export type UpdateArchivedChatListResponse = {
    needResync: boolean;
    version: number;
};
export declare const updateArchivedChatListFactory: (ctx: import("../context.js").ContextBase, api: import("../apis.js").API) => (isArchived: boolean, conversations: UpdateArchivedChatListTarget | UpdateArchivedChatListTarget[]) => Promise<UpdateArchivedChatListResponse>;
