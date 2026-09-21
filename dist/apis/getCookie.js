import { apiFactory } from "../utils.js";
export const getCookieFactory = apiFactory()((_, ctx) => {
    /**
     * Get the current cookie string
     */
    return function getCookie() {
        return ctx.cookie;
    };
});
