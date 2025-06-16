import { apiFactory } from "../utils.js";
export const customFactory = apiFactory()((api, ctx, utils) => {
    return function custom(name, callback) {
        Object.defineProperty(api, name, {
            value: function (props) {
                return callback({ ctx, utils, props });
            },
            writable: false,
            enumerable: false,
            configurable: false,
        });
    };
});
