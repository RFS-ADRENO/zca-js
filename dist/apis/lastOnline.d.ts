export type LastOnlineResponse = {
    settings: {
        show_online_status: boolean;
    };
    lastOnline: number;
};
export declare const lastOnlineFactory: (ctx: import("../context.js").ContextBase, api: import("../apis.js").API) => (uid: string) => Promise<LastOnlineResponse>;
