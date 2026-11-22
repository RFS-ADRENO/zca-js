import { ZaloApiError } from "../Errors/ZaloApiError.js";

/**
 * Minimal protobuf decoder for the two `SyncChunk` messages used by Zalo's sync v2
 * (`proto.Sync2.Conversation.SyncChunk` and `proto.Sync2.Message.SyncChunk`).
 *
 * 64 bit integers (ids, timestamps bigger than 2^53) are returned as strings.
 */

export enum SyncPlatform {
    Unspecified = 0,
    Mobile = 1,
    Web = 2,
    PC = 3,
    System = 4,
}

export enum SyncConversationType {
    Unspecified = 0,
    OneOne = 1,
    Group = 2,
}

export enum SyncMessageStatus {
    Unspecified = 0,
    Fail = 1,
    Sending = 2,
    Sent = 3,
    Received = 4,
    Seen = 5,
}

export type SyncProtoConversation = {
    /** noised (global) id of the conversation, not the user/group id */
    convId: string;
    convType: SyncConversationType;
    respondedByMe: boolean;
    lastTs: number;
    lastGlobalId: string;
    lastClientId: string;
};

export type SyncProtoConversationChunk = {
    platform: SyncPlatform;
    conversations: SyncProtoConversation[];
};

export type SyncProtoAttach = {
    type?: string;
    extInfo?: string;
    action?: string;
    params?: string;
    title?: string;
    href?: string;
    thumb?: string;
    description?: string;
    catId?: number;
    id?: number;
    childNumber?: number;
    remains?: string;
    zinstantData?: string;
    zinstantMsg?: string;
};

export type SyncProtoMention = {
    uid: string;
    pos: number;
    len: number;
    type: number;
};

export type SyncProtoQuote = {
    attach: string;
    ownerId: string;
    ts: number;
    fromD: string;
    cliMsgId: string;
    globalMsgId: string;
    msg: string;
    cliMsgType: number;
    ttl?: number;
    partialQuote?: string;
};

export type SyncProtoProperties = {
    size?: number;
    color?: number;
    type?: number;
    subType?: number;
    ext?: string;
};

export type SyncProtoMeta = {
    attachs: SyncProtoAttach[];
    mentions: SyncProtoMention[];
    reference?: { type: number; data: string };
    quote?: SyncProtoQuote;
    property?: SyncProtoProperties;
    ttl?: number;
};

export type SyncProtoMessage = {
    /** noised (global) id of the sender */
    senderId: string;
    clientId: string;
    msgStatus: SyncMessageStatus;
    msgType: number;
    timestamp: number;
    globalId: string;
    content: string;
    meta?: SyncProtoMeta;
};

export type SyncProtoPartition = {
    /** `group/<noisedId>` or `oneone/<noisedId>` */
    id: string;
    messages: SyncProtoMessage[];
};

export type SyncProtoMessageChunk = {
    platform: SyncPlatform;
    partitions: SyncProtoPartition[];
};

const textDecoder = new TextDecoder("utf-8");

class Reader {
    private pos = 0;
    constructor(private buf: Uint8Array) {}

    get done() {
        return this.pos >= this.buf.length;
    }

    varint(): bigint {
        let result = BigInt(0);
        let shift = BigInt(0);
        for (;;) {
            if (this.pos >= this.buf.length) throw new ZaloApiError("Malformed sync data: truncated varint");
            const byte = this.buf[this.pos++];
            result |= BigInt(byte & 0x7f) << shift;
            if ((byte & 0x80) === 0) return result;
            shift += BigInt(7);
            if (shift > BigInt(63)) throw new ZaloApiError("Malformed sync data: varint too long");
        }
    }

    bytes(): Uint8Array {
        const length = Number(this.varint());
        const end = this.pos + length;
        if (end > this.buf.length) throw new ZaloApiError("Malformed sync data: truncated field");
        const slice = this.buf.subarray(this.pos, end);
        this.pos = end;
        return slice;
    }

    skip(wireType: number) {
        if (wireType === 0) this.varint();
        else if (wireType === 1) this.pos += 8;
        else if (wireType === 2) this.bytes();
        else if (wireType === 5) this.pos += 4;
        else throw new ZaloApiError(`Malformed sync data: unsupported wire type ${wireType}`);
    }
}

type FieldKind = "string" | "uint64" | "int64" | "number" | "int32" | "bool" | Schema;
type Field = { name: string; kind: FieldKind; repeated?: boolean };
type Schema = { fields: Record<number, Field>; defaults: () => Record<string, unknown> };

function decode<T>(schema: Schema, buf: Uint8Array): T {
    const reader = new Reader(buf);
    const out = schema.defaults();

    while (!reader.done) {
        const tag = Number(reader.varint());
        const fieldNumber = tag >>> 3;
        const wireType = tag & 7;
        const field = schema.fields[fieldNumber];

        if (!field) {
            reader.skip(wireType);
            continue;
        }

        let value: unknown;
        if (typeof field.kind === "object") {
            value = decode(field.kind, reader.bytes());
        } else if (field.kind === "string") {
            value = textDecoder.decode(reader.bytes());
        } else {
            const raw = reader.varint();
            if (field.kind === "bool") value = raw !== BigInt(0);
            else if (field.kind === "uint64") value = raw.toString();
            else if (field.kind === "int64") value = BigInt.asIntN(64, raw).toString();
            else if (field.kind === "int32") value = Number(BigInt.asIntN(32, raw));
            else value = Number(raw); // timestamps and enums, always safe integers
        }

        if (field.repeated) (out[field.name] as unknown[]).push(value);
        else out[field.name] = value;
    }

    return out as T;
}

const schema = (fields: Record<number, Field>, defaults: () => Record<string, unknown>): Schema => ({
    fields,
    defaults,
});

const ConversationSchema = schema(
    {
        1: { name: "convId", kind: "string" },
        2: { name: "convType", kind: "number" },
        3: { name: "respondedByMe", kind: "bool" },
        4: { name: "lastTs", kind: "number" },
        5: { name: "lastGlobalId", kind: "uint64" },
        6: { name: "lastClientId", kind: "uint64" },
    },
    () => ({ convId: "", convType: 0, respondedByMe: false, lastTs: 0, lastGlobalId: "0", lastClientId: "0" }),
);

const ConversationChunkSchema = schema(
    {
        1: { name: "platform", kind: "number" },
        2: { name: "conversations", kind: ConversationSchema, repeated: true },
    },
    () => ({ platform: 0, conversations: [] }),
);

const AttachSchema = schema(
    {
        1: { name: "type", kind: "string" },
        2: { name: "extInfo", kind: "string" },
        3: { name: "action", kind: "string" },
        4: { name: "params", kind: "string" },
        5: { name: "title", kind: "string" },
        6: { name: "href", kind: "string" },
        7: { name: "thumb", kind: "string" },
        8: { name: "description", kind: "string" },
        9: { name: "catId", kind: "int32" },
        10: { name: "id", kind: "int32" },
        11: { name: "childNumber", kind: "int32" },
        12: { name: "remains", kind: "string" },
        13: { name: "zinstantData", kind: "string" },
        14: { name: "zinstantMsg", kind: "string" },
    },
    () => ({}),
);

const MentionSchema = schema(
    {
        1: { name: "uid", kind: "string" },
        2: { name: "pos", kind: "int32" },
        3: { name: "len", kind: "int32" },
        4: { name: "type", kind: "int32" },
    },
    () => ({ uid: "", pos: 0, len: 0, type: 0 }),
);

const ReferenceSchema = schema(
    {
        1: { name: "type", kind: "int32" },
        2: { name: "data", kind: "string" },
    },
    () => ({ type: 0, data: "" }),
);

const QuoteSchema = schema(
    {
        1: { name: "attach", kind: "string" },
        2: { name: "ownerId", kind: "string" },
        3: { name: "ts", kind: "number" },
        4: { name: "fromD", kind: "string" },
        5: { name: "cliMsgId", kind: "uint64" },
        6: { name: "globalMsgId", kind: "uint64" },
        7: { name: "msg", kind: "string" },
        8: { name: "cliMsgType", kind: "int32" },
        9: { name: "ttl", kind: "number" },
        10: { name: "partialQuote", kind: "string" },
    },
    () => ({ attach: "", ownerId: "", ts: 0, fromD: "", cliMsgId: "0", globalMsgId: "0", msg: "", cliMsgType: 0 }),
);

const PropertiesSchema = schema(
    {
        1: { name: "size", kind: "int32" },
        2: { name: "color", kind: "int32" },
        3: { name: "type", kind: "int32" },
        4: { name: "subType", kind: "int32" },
        5: { name: "ext", kind: "string" },
    },
    () => ({}),
);

const MetaSchema = schema(
    {
        1: { name: "attachs", kind: AttachSchema, repeated: true },
        2: { name: "mentions", kind: MentionSchema, repeated: true },
        3: { name: "reference", kind: ReferenceSchema },
        4: { name: "quote", kind: QuoteSchema },
        5: { name: "property", kind: PropertiesSchema },
        6: { name: "ttl", kind: "number" },
    },
    () => ({ attachs: [], mentions: [] }),
);

const MessageSchema = schema(
    {
        1: { name: "senderId", kind: "string" },
        2: { name: "clientId", kind: "uint64" },
        3: { name: "msgStatus", kind: "number" },
        4: { name: "msgType", kind: "int32" },
        5: { name: "timestamp", kind: "number" },
        6: { name: "globalId", kind: "int64" },
        7: { name: "content", kind: "string" },
        8: { name: "meta", kind: MetaSchema },
    },
    () => ({ senderId: "", clientId: "0", msgStatus: 0, msgType: 0, timestamp: 0, globalId: "0", content: "" }),
);

const PartitionSchema = schema(
    {
        1: { name: "id", kind: "string" },
        2: { name: "messages", kind: MessageSchema, repeated: true },
    },
    () => ({ id: "", messages: [] }),
);

const MessageChunkSchema = schema(
    {
        1: { name: "platform", kind: "number" },
        2: { name: "partitions", kind: PartitionSchema, repeated: true },
    },
    () => ({ platform: 0, partitions: [] }),
);

export function decodeConversationChunk(data: Uint8Array): SyncProtoConversationChunk {
    return decode<SyncProtoConversationChunk>(ConversationChunkSchema, data);
}

export function decodeMessageChunk(data: Uint8Array): SyncProtoMessageChunk {
    return decode<SyncProtoMessageChunk>(MessageChunkSchema, data);
}
