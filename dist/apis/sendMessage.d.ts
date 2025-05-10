import { ThreadType, type TMessage } from "../models/index.js";
export type SendMessageResult = {
    msgId: number;
};
export type SendMessageResponse = {
    message: SendMessageResult | null;
    attachment: SendMessageResult[];
};
export type SendMessageQuote = {
    content: TMessage["content"];
    msgType: TMessage["msgType"];
    propertyExt: TMessage["propertyExt"];
    uidFrom: TMessage["uidFrom"];
    msgId: TMessage["msgId"];
    cliMsgId: TMessage["cliMsgId"];
    ts: TMessage["ts"];
    ttl: TMessage["ttl"];
};
export declare enum TextStyle {
    Bold = "b",
    Italic = "i",
    Underline = "u",
    StrikeThrough = "s",
    Red = "c_db342e",
    Orange = "c_f27806",
    Yellow = "c_f7b503",
    Green = "c_15a85f",
    Small = "f_13",
    Big = "f_18",
    UnorderedList = "lst_1",
    OrderedList = "lst_2",
    Indent = "ind_$"
}
export type Style = {
    start: number;
    len: number;
    st: Exclude<TextStyle, TextStyle.Indent>;
} | {
    start: number;
    len: number;
    st: TextStyle.Indent;
    /**
     * Number of spaces used for indentation.
     */
    indentSize?: number;
};
export declare enum Urgency {
    Default = 0,
    Important = 1,
    Urgent = 2
}
export type Mention = {
    /**
     * mention position
     */
    pos: number;
    /**
     * id of the mentioned user
     */
    uid: string;
    /**
     * length of the mention
     */
    len: number;
};
export type MessageContent = {
    /**
     * Text content of the message
     */
    msg: string;
    /**
     * Text styles
     */
    styles?: Style[];
    /**
     * Urgency of the message
     */
    urgency?: Urgency;
    /**
     * Quoted message (optional)
     */
    quote?: SendMessageQuote;
    /**
     * Mentions in the message (optional)
     */
    mentions?: Mention[];
    /**
     * Attachments in the message (optional)
     */
    attachments?: string[];
    /**
     * Time to live in milisecond
     */
    ttl?: number;
};
export declare const sendMessageFactory: (ctx: import("../context.js").ContextBase, api: import("../zalo.js").API) => (message: MessageContent | string, threadId: string, type?: ThreadType) => Promise<{
    message: SendMessageResult | null;
    attachment: SendMessageResult[];
}>;
