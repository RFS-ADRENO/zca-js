export type DataBiz = {
    desc: string;
    cate: number;
    addr: string;
    website: string;
    email: string;
};
export type SettingStartPage = {
    enable_biz_label: number;
    enable_cate: number;
    enable_add: number;
    cta_profile: number;
    cta_catalog: null;
};
export type GetBizAccountResponse = {
    biz: DataBiz;
    pkgId: number;
    setting_start_page: SettingStartPage;
};
export declare const getBizAccountFactory: (ctx: import("../context.js").ContextBase, api: import("../zalo.js").API) => (friendId: string) => Promise<GetBizAccountResponse>;
