export type DeleteAvatarResponse = {
    delPhotoIds: string[];
    errMap: {
        [key: string]: {
            err: number;
        };
    };
};
export declare const deleteAvatarFactory: (ctx: import("../context.js").ContextBase, api: import("../apis.js").API) => (photoId: string | string[]) => Promise<DeleteAvatarResponse>;
