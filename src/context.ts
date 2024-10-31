type UploadEventData = {
    fileUrl: string;
    fileId: string;
};

export type UploadCallback = (data: UploadEventData) => any;

type ShareFileSettings = {
    big_file_domain_list: string[];
    max_size_share_file_v2: number;
    max_size_share_file_v3: number;
    file_upload_show_icon_1GB: boolean;
    restricted_ext: string;
    next_file_time: number;
    max_file: number;
    max_size_photo: number;
    max_size_share_file: number;
    max_size_resize_photo: number;
    max_size_gif: number;
    max_size_original_photo: number;
    chunk_size_file: number;
    restricted_ext_file: string[];
};

export type AppContextBase = {
    uid: string;
    imei: string;
    cookie: string;
    userAgent: string;
    language: string;
    secretKey: string | null;
    zpwServiceMap: Record<string, string[]>;
    settings: {
        [key: string]: any;
        features: {
            [key: string]: any;
            sharefile: ShareFileSettings;
        };
    };
    extraVer: ExtraVer;
};

export type Options = {
    selfListen: boolean;
    checkUpdate: boolean;
};

type ExtraVer = {
    phonebook: number;
    conv_label: string;
    friend: string;
    ver_sticker_giphy_suggest: number;
    ver_giphy_cate: number;
    alias: string;
    ver_sticker_cate_list: number;
    block_friend: string;
};

const _5_MINUTES = 5 * 60 * 1000;
class CallbacksMap extends Map<string, UploadCallback> {
    /**
     * @param ttl Time to live in milliseconds. Default is 5 minutes.
     */
    set(key: string, value: UploadCallback, ttl: number = _5_MINUTES): this {
        setTimeout(() => {
            this.delete(key);
        }, ttl);
        return super.set(key, value);
    }
}

export type AppContextExtended = {
    uploadCallbacks: CallbacksMap;
    options: Options;
    readonly API_TYPE: number;
    readonly API_VERSION: number;
};

export const appContext: Partial<AppContextBase> & AppContextExtended = {
    API_TYPE: 30,
    API_VERSION: 645,
    uploadCallbacks: new CallbacksMap(),
    options: {
        selfListen: false,
        checkUpdate: true,
    },
};

export type ValidContext = AppContextBase & AppContextExtended & { secretKey: string };

export function isContextValid(ctx: typeof appContext): ctx is ValidContext {
    return !!ctx.secretKey;
}
