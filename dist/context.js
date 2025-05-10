const _5_MINUTES = 5 * 60 * 1000;
class CallbacksMap extends Map {
    /**
     * @param ttl Time to live in milliseconds. Default is 5 minutes.
     */
    set(key, value, ttl = _5_MINUTES) {
        setTimeout(() => {
            this.delete(key);
        }, ttl);
        return super.set(key, value);
    }
}
export const createContext = (apiType = 30, apiVersion = 648) => ({
    API_TYPE: apiType,
    API_VERSION: apiVersion,
    uploadCallbacks: new CallbacksMap(),
    options: {
        selfListen: false,
        checkUpdate: true,
        logging: true,
        polyfill: global.fetch,
    },
    secretKey: null,
});
export function isContextSession(ctx) {
    return !!ctx.secretKey;
}
export const MAX_MESSAGES_PER_SEND = 50;
