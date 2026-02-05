import { apiFactory } from "../../utils/index.js";

export const getOwnIdFactory = apiFactory()((_, ctx) => {
    return () => ctx.uid;
});
