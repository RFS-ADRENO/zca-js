export type AvatarListOptions = {
    page?: number;
    count?: number;
};
export type GetAvatarListResponse = {
    albumId: string;
    nextPhotoId: string;
    hasMore: number;
    photos: {
        photoId: string;
        thumbnail: string;
        url: string;
        bkUrl: string;
    }[];
};
export declare const getAvatarListFactory: (ctx: import("../context.js").ContextBase, api: import("../zalo.js").API) => (options: AvatarListOptions) => Promise<GetAvatarListResponse>;
