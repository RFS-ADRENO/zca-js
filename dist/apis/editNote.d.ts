export type EditNoteResponse = {
    id: string;
    type: number;
    color: number;
    emoji: string;
    startTime: number;
    duration: number;
    params: {
        title: string;
        extra: string;
    };
    creatorId: string;
    editorId: string;
    createTime: number;
    editTime: number;
    repeat: number;
};
export declare const editNoteFactory: (ctx: import("../context.js").ContextBase, api: import("../zalo.js").API) => (title: string, topicId: string, groupId: string) => Promise<EditNoteResponse>;
