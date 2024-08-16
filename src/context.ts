type UploadEventData = {
    fileUrl: string;
    fileId: string;
}

export type UploadCallback = (data: UploadEventData) => any;

type ShareFileSettings = {
    big_file_domain_list: string[]
    max_size_share_file_v2: number
    max_size_share_file_v3: number
    file_upload_show_icon_1GB: boolean
    restricted_ext: string
    next_file_time: number
    max_file: number
    max_size_photo: number
    max_size_share_file: number
    max_size_resize_photo: number
    max_size_gif: number
    max_size_original_photo: number
    chunk_size_file: number
    restricted_ext_file: string[]
  }

type AppContextBase = {
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
        }
    }
}

type AppContextExtended = {
    uploadCallbacks: Map<string, UploadCallback>;
}

export const appContext: Partial<AppContextBase> & AppContextExtended = {
    uploadCallbacks: new Map(),
};
