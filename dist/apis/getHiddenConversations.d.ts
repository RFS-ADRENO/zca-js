export type GetHiddenConversationsResponse = {
    pin: string;
    threads: {
        /**
         * 1: true, 0: false
         */
        is_group: number;
        thread_id: string;
    }[];
};
export declare const getHiddenConversationsFactory: (ctx: import("../context.js").ContextBase, api: import("../apis.js").API) => () => Promise<GetHiddenConversationsResponse>;
