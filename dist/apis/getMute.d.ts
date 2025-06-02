export type MuteEntriesInfo = {
    id: string;
    duration: number;
    startTime: number;
    systemTime: number;
    currentTime: number;
    muteMode: number;
};
export type GetMuteResponse = {
    chatEntries: MuteEntriesInfo[];
    groupChatEntries: MuteEntriesInfo[];
};
export declare const getMuteFactory: (ctx: import("../context.js").ContextBase, api: import("../zalo.js").API) => () => Promise<GetMuteResponse>;
