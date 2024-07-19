import { appContext } from "../context.js";

export function getOwnId() {
    return appContext.uid;
}
