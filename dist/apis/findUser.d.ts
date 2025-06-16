export type FindUserResponse = {
    avatar: string;
    cover: string;
    status: string;
    gender: number;
    dob: number;
    sdob: string;
    globalId: string;
    bizPkg: {
        pkgId: number;
    };
    uid: string;
    zalo_name: string;
    display_name: string;
};
export declare const findUserFactory: (ctx: import("../context.js").ContextBase, api: import("../zalo.js").API) => (phoneNumber: string) => Promise<FindUserResponse>;
