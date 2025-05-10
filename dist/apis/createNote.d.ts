export type CreateNoteOptions = {
    title: string;
    pinAct?: boolean;
};
export type CreateNoteResponse = {
    id: string;
    type: number;
    color: number;
    emoji: string;
    startTime: number;
    duration: number;
    params: {
        title: string;
    };
    creatorId: string;
    editorId: string;
    createTime: number;
    editTime: number;
    repeat: number;
};
export declare const createNoteFactory: (ctx: import("../context.js").ContextBase, api: import("../zalo.js").API) => (options: CreateNoteOptions, groupId: string) => Promise<CreateNoteResponse>;
