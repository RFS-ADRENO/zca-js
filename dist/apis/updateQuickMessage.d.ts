export type Message = {
    title: string;
    params: string | null;
};
export type QuickMessage = {
    id: number;
    keyword: string;
    type: number;
    createdTime: number;
    lastModified: number;
    message: Message;
    media: null;
};
export type UpdateQuickMessageResponse = {
    items: QuickMessage[];
    version: number;
};
export declare const updateQuickMessageFactory: (ctx: import("../context.js").ContextBase, api: import("../zalo.js").API) => (keyword: string, title: string, itemId: number) => Promise<UpdateQuickMessageResponse>;
