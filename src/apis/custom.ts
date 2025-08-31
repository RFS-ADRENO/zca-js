import { type ContextSession } from "../context.js";
import { apiFactory, type FactoryUtils } from "../utils.js";

export type CustomAPIProps<T, K> = { ctx: ContextSession; utils: FactoryUtils<T>; props: K };
export type CustomAPICallback<T, K> = (props: CustomAPIProps<T, K>) => T | Promise<T>;

/* eslint-disable */
export const customFactory = apiFactory<any>()((api, ctx, utils) => {
    return function custom<T, K = any>(name: string, callback: CustomAPICallback<T, K>) {
        Object.defineProperty(api, name, {
            value: function (props: K) {
                return callback({ ctx, utils, props });
            },
            writable: false,
            enumerable: false,
            configurable: false,
        });
    };
});
