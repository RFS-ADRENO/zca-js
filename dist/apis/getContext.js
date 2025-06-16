import { apiFactory } from "../utils.js";
export const getContextFactory = apiFactory()((_, ctx) => {
    return () => ctx;
});
