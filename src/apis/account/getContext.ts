import { apiFactory } from "../../utils/index.js";

export const getContextFactory = apiFactory()((_, ctx) => {
    return () => ctx;
});
