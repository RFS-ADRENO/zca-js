export type ChangeGroupNameResponse = {
    status: number;
};
export declare const changeGroupNameFactory: (ctx: import("../context.js").ContextBase, api: import("../apis.js").API) => (name: string, groupId: string) => Promise<ChangeGroupNameResponse>;
