import { GroupMessage } from "../models/index.js";
export type GetGroupChatHistoryResponse = {
    lastActionId: string;
    lastActionIdOther: string;
    more: number;
    groupMsgs: GroupMessage[];
};
export declare const getGroupChatHistoryFactory: (ctx: import("../context.js").ContextBase, api: import("../apis.js").API) => (groupId: string, count?: number) => Promise<GetGroupChatHistoryResponse>;
