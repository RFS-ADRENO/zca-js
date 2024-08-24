import { appContext } from "../context.js";

export function getCookieFactory() {
    /**
     * Get the current cookie string
     */
    return function getCookie() {
        return appContext.cookie;
    };
}
