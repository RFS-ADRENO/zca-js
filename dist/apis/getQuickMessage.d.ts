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
export type GetQuickMessageResponse = {
    cursor: number;
    version: number;
    items: QuickMessage[];
};
export declare const getQuickMessageFactory: (ctx: import("../context.js").ContextBase, api: import("../zalo.js").API) => () => Promise<GetQuickMessageResponse>;
