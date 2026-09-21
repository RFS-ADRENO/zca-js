import type { NoteDetail } from "../models/index.js";
export type CreateNoteOptions = {
    title: string;
    pinAct?: boolean;
};
export type CreateNoteResponse = NoteDetail;
export declare const createNoteFactory: (ctx: import("../context.js").ContextBase, api: import("../apis.js").API) => (options: CreateNoteOptions, groupId: string) => Promise<NoteDetail>;
