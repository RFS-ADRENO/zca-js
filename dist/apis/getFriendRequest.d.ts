export type CollapseMsgListConfig = {
    collapseId: number;
    collapseXItem: number;
    collapseYItem: number;
};
export type RecommInfo = {
    source: number;
    message: string;
};
export type BizPkg = {
    pkgId: number;
};
export type DataInfo = {
    userId: string;
    zaloName: string;
    displayName: string;
    avatar: string;
    phoneNumber: string;
    status: string;
    gender: number;
    dob: number;
    type: number;
    recommType: number;
    recommSrc: number;
    recommTime: number;
    recommInfo: RecommInfo;
    bizPkg: BizPkg;
    isSeenFriendReq: boolean;
};
export type RecommItem = {
    recommItemType: number;
    dataInfo: DataInfo;
};
export type GetFriendRequestResponse = {
    expiredDuration: number;
    collapseMsgListConfig: CollapseMsgListConfig;
    recommItems: RecommItem[];
};
export declare const getFriendRequestFactory: (ctx: import("../context.js").ContextBase, api: import("../zalo.js").API) => () => Promise<GetFriendRequestResponse>;
