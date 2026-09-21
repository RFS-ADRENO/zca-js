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
export declare const getAvatarListFactory: (ctx: import("../context.js").ContextBase, api: import("../apis.js").API) => (count?: number, page?: number) => Promise<GetAvatarListResponse>;
