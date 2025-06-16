import { DestType, ThreadType } from "../models/Enum.js";
export type SendTypingEventResponse = {
    status: number;
};
export type SendTypingEventOptions<T extends ThreadType> = {
    type: T;
    destType?: undefined;
} & (T extends ThreadType.User ? {
    destType: DestType;
} : {});
export declare const sendTypingEventFactory: (ctx: import("../context.js").ContextBase, api: import("../zalo.js").API) => <T extends ThreadType>(id: string, options: SendTypingEventOptions<T>) => Promise<SendTypingEventResponse>;
