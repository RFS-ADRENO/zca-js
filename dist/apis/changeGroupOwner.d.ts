export type ChangeGroupOwnerResponse = {
    time: number;
};
export declare const changeGroupOwnerFactory: (ctx: import("../context.js").ContextBase, api: import("../zalo.js").API) => (memberId: string, groupId: string) => Promise<ChangeGroupOwnerResponse>;
