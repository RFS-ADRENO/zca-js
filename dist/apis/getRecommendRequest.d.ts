export type CollapseMsgListConfig1 = {
    collapseId: number;
    collapseXItem: number;
    collapseYItem: number;
};
export type RecommInfo1 = {
    source: number;
    message: string;
};
export type BizPkg1 = {
    pkgId: number;
};
export type DataInfo1 = {
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
    recommInfo: RecommInfo1;
    bizPkg: BizPkg1;
    isSeenFriendReq: boolean;
};
export type RecommItem1 = {
    recommItemType: number;
    dataInfo: DataInfo1;
};
export type getRecommendRequestResponse = {
    expiredDuration: number;
    collapseMsgListConfig: CollapseMsgListConfig1;
    recommItems: RecommItem1[];
    isSend?: any;
};
export declare const getRecommendRequestFactory: (ctx: import("../context.js").ContextBase, api: import("../zalo.js").API) => () => Promise<getRecommendRequestResponse>;
