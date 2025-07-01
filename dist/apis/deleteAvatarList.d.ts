export type DeleteAvatarListOptions = {
    photoId: string | string[];
};
export type DeleteAvatarListResponse = {
    delPhotoIds: string[];
    errMap: {
        [key: string]: {
            err: number;
        };
    };
};
export declare const deleteAvatarListFactory: (ctx: import("../context.js").ContextBase, api: import("../zalo.js").API) => (options: DeleteAvatarListOptions) => Promise<DeleteAvatarListResponse>;
