export type CreateNoteGroupOptions = {
    title: string;
    color?: string;
    emoji?: string;
    pinAct?: boolean;
};
export type CreateNoteGroupResponse = {
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
export declare const createNoteGroupFactory: (ctx: import("../context.js").ContextBase, api: import("../zalo.js").API) => (options: CreateNoteGroupOptions, groupId: string) => Promise<CreateNoteGroupResponse>;
