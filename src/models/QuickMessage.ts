export type QuickMessage = {
    id: number;
    keyword: string;
    type: number;
    createdTime: number;
    lastModified: number;
    message: {
        title: string;
        params: string | null;
    };
    media: null;
};
