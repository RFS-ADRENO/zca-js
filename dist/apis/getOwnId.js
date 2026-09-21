import { apiFactory } from "../utils.js";
export const getOwnIdFactory = apiFactory()((_, ctx) => {
    return () => ctx.uid;
});
