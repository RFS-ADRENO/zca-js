import { type ContextSession } from "../context.js";
import { type FactoryUtils } from "../utils.js";
export type CustomAPIProps<T, K> = {
    ctx: ContextSession;
    utils: FactoryUtils<T>;
    props: K;
};
export type CustomAPICallback<T, K> = (props: CustomAPIProps<T, K>) => T | Promise<T>;
export declare const customFactory: (ctx: import("../context.js").ContextBase, api: import("../zalo.js").API) => <T, K = any>(name: string, callback: CustomAPICallback<T, K>) => void;
