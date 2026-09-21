export type GetListDeviceResponse = {
    devices: {
        masterId: string;
        encIdentity: string;
        lastUpdateTs: number;
        encSignature: string;
        companions: unknown[];
    };
};
export declare const getListDeviceFactory: (ctx: import("../context.js").ContextBase, api: import("../apis.js").API) => () => Promise<GetListDeviceResponse>;
