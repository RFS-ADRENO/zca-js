export type GetFriendRequestResponse = {
    [key: string]: {
        userId: string;
        zaloName: string;
        displayName: string;
        avatar: string;
        globalId: string;
        bizPkg: {
            pkgId: number;
        };
        fReqInfo: {
            message: string;
            src: number;
            time: number;
        };
    };
};
export declare const getFriendRequestFactory: (ctx: import("../context.js").ContextBase, api: import("../zalo.js").API) => () => Promise<GetFriendRequestResponse>;
