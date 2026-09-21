import type { NoteDetail } from "../models/index.js";
export type EditNoteOptions = {
    /**
     * New note title
     */
    title: string;
    /**
     * Topic ID to edit note from
     */
    topicId: string;
    /**
     * Should the note be pinned?
     */
    pinAct?: boolean;
};
export type EditNoteResponse = NoteDetail;
export declare const editNoteFactory: (ctx: import("../context.js").ContextBase, api: import("../apis.js").API) => (options: EditNoteOptions, groupId: string) => Promise<NoteDetail>;
