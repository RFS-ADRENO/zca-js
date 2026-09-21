import type { BusinessCategory } from "../models/index.js";
export type GetBizAccountResponse = {
    biz?: {
        desc: string | null;
        cate: BusinessCategory;
        addr: string;
        website: string;
        email: string;
    };
    setting_start_page?: {
        enable_biz_label: number;
        enable_cate: number;
        enable_add: number;
        cta_profile: number;
        /**
         * Relative path used to build the catalog URL.
         *
         * Example: https://catalog.zalo.me/${cta_catalog}
         */
        cta_catalog: string | null;
    } | null;
    pkgId: number;
};
export declare const getBizAccountFactory: (ctx: import("../context.js").ContextBase, api: import("../apis.js").API) => (friendId: string) => Promise<GetBizAccountResponse>;
