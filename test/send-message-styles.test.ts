import { describe, expect, mock, test } from "bun:test";
import type { API } from "../src/apis.js";
import { sendMessageFactory, TextStyle, Urgency, type MessageContent } from "../src/apis/sendMessage.js";
import type { UploadAttachmentImageResponse } from "../src/apis/uploadAttachment.js";
import { createContext } from "../src/context.js";
import { ThreadType, type AttachmentSource } from "../src/models/index.js";
import { decodeAES, encodeAES } from "../src/utils.js";

const styles = [{ start: 3, len: 4, st: TextStyle.Bold }] satisfies MessageContent["styles"];
const msg = "Hi test";

function image(filename: `${string}.${string}` = "image.png"): AttachmentSource {
    return { data: Buffer.alloc(1), filename, metadata: { width: 1, height: 1, totalSize: 1 } };
}

function setup(failText = false) {
    const requests: { path: string; params: Record<string, unknown> }[] = [];
    const order: string[] = [];
    const ctx = createContext();
    ctx.secretKey = Buffer.alloc(16).toString("base64");
    ctx.imei = "offline-test";
    ctx.userAgent = "offline-test";
    ctx.settings = { features: { sharefile: { max_file: 10 } } } as typeof ctx.settings;
    ctx.options.polyfill = mock(async (input: string | URL | Request, init?: RequestInit) => {
        const path = new URL(String(input)).pathname;
        const body = init?.body as URLSearchParams;
        const params = JSON.parse(decodeAES(ctx.secretKey!, body.get("params")!)!);
        requests.push({ path, params });
        order.push(path);
        if (failText && !path.endsWith("/send")) return new Response(null, { status: 503 });
        return Response.json({
            error_code: 0,
            data: encodeAES(ctx.secretKey!, JSON.stringify({ error_code: 0, data: { msgId: requests.length } })),
        });
    }) as typeof fetch;
    const uploadAttachment = mock(async (sources: AttachmentSource | AttachmentSource[]) => {
        order.push("upload");
        return (Array.isArray(sources) ? sources : [sources]).map(
            (_, index): UploadAttachmentImageResponse => ({
                fileType: "image",
                width: 1,
                height: 1,
                totalSize: 1,
                hdSize: 1,
                finished: 1,
                normalUrl: "https://example.invalid/image.png",
                hdUrl: "https://example.invalid/image.png",
                thumbUrl: "https://example.invalid/image.png",
                chunkId: 1,
                photoId: `photo-${index}`,
                clientFileId: index,
            }),
        );
    });
    const api = {
        zpwServiceMap: {
            chat: ["https://example.invalid"],
            group: ["https://example.invalid"],
            file: ["https://example.invalid"],
        },
        uploadAttachment,
    } as unknown as API;
    return { sendMessage: sendMessageFactory(ctx, api), requests, order, uploadAttachment };
}

for (const type of [ThreadType.User, ThreadType.Group]) {
    const base = type === ThreadType.User ? "/api/message" : "/api/group";
    const textPath = `${base}/${type === ThreadType.User ? "sms" : "sendmsg"}`;
    const imagePath = `${base}/photo_original/send`;
    const recipient = type === ThreadType.User ? { toid: "thread" } : { grid: "thread" };

    describe(`sendMessage styles with attachments (thread type ${type})`, () => {
        test.each(["jpg", "jpeg", "png", "webp"])("sends styled text before a single %s image", async (ext) => {
            const { sendMessage, requests, order } = setup();
            const message = { msg, styles, attachments: image(`image.${ext}`), ttl: 60000, urgency: Urgency.Important };
            const result = await sendMessage(message, "thread", type);

            expect(order).toEqual([textPath, "upload", imagePath]);
            expect(requests[0].params).toMatchObject({
                message: msg,
                ...recipient,
                ttl: 60000,
                metaData: { urgency: 1 },
            });
            expect(JSON.parse(requests[0].params.textProperties as string)).toEqual({ styles, ver: 0 });
            expect(requests[1].params).toMatchObject({ desc: "", ...recipient, ttl: 60000, metaData: { urgency: 1 } });
            expect(requests[1].params).not.toHaveProperty("mentionInfo");
            expect(result).toEqual({ message: { msgId: 1 }, attachment: [{ msgId: 2 }] });
            expect(message.msg).toBe(msg);
            expect(message.styles).toEqual(styles);
        });

        test.each([{ styles: undefined }, { styles: [] }])(
            "keeps a single-image caption when styles is %j",
            async ({ styles: emptyStyles }) => {
                const { sendMessage, requests, order } = setup();
                const result = await sendMessage({ msg, styles: emptyStyles, attachments: image() }, "thread", type);
                expect(order).toEqual(["upload", imagePath]);
                expect(requests[0].params.desc).toBe(msg);
                expect(result.message).toBeNull();
            },
        );

        test("does not create an empty text message", async () => {
            const { sendMessage, requests, order } = setup();
            await sendMessage({ msg: "", styles, attachments: image() }, "thread", type);
            expect(order).toEqual(["upload", imagePath]);
            expect(requests[0].params.desc).toBe("");
        });

        test("preserves styled text without attachments", async () => {
            const { sendMessage, requests, order } = setup();
            await sendMessage({ msg, styles }, "thread", type);
            expect(order).toEqual([textPath]);
            expect(requests[0].params.message).toBe(msg);
            expect(JSON.parse(requests[0].params.textProperties as string)).toEqual({ styles, ver: 0 });
        });

        test("keeps multiple-image text separate and preserves image order", async () => {
            const { sendMessage, requests, order } = setup();
            await sendMessage({ msg, styles, attachments: [image(), image()] }, "thread", type);
            expect(order).toEqual([textPath, "upload", imagePath, imagePath]);
            expect(JSON.parse(requests[0].params.textProperties as string)).toEqual({ styles, ver: 0 });
            expect(requests.slice(1).map(({ params }) => [params.desc, params.photoId, params.idInGroup])).toEqual([
                ["", "photo-0", 0],
                ["", "photo-1", 1],
            ]);
        });

        test("keeps quotes on the styled text", async () => {
            const { sendMessage, requests, order } = setup();
            const quote = {
                content: "quoted text",
                msgType: "webchat",
                propertyExt: undefined,
                uidFrom: "sender",
                msgId: "quoted-message",
                cliMsgId: "quoted-client",
                ts: "1",
                ttl: 0,
            } satisfies NonNullable<MessageContent["quote"]>;
            await sendMessage({ msg, styles, quote, attachments: image() }, "thread", type);
            expect(order).toEqual([`${base}/quote`, "upload", imagePath]);
            expect(requests[0].params).toMatchObject({ qmsg: quote.content, qmsgId: quote.msgId, message: msg });
            expect(JSON.parse(requests[0].params.textProperties as string)).toEqual({ styles, ver: 0 });
            expect(requests[1].params.desc).toBe("");
        });

        test("does not upload or send the image after a text send failure", async () => {
            const { sendMessage, requests, uploadAttachment } = setup(true);
            await expect(sendMessage({ msg, styles, attachments: image() }, "thread", type)).rejects.toThrow("503");
            expect(requests).toHaveLength(1);
            expect(uploadAttachment).not.toHaveBeenCalled();
        });
    });
}

test("keeps group mentions and their offsets on the styled text only", async () => {
    const { sendMessage, requests, order } = setup();
    const mentions = [{ pos: 3, len: 4, uid: "mentioned-user" }];
    await sendMessage({ msg, styles, mentions, attachments: image() }, "thread", ThreadType.Group);
    expect(order).toEqual(["/api/group/mention", "upload", "/api/group/photo_original/send"]);
    expect(requests[0].params.message).toBe(msg);
    expect(JSON.parse(requests[0].params.mentionInfo as string)).toEqual([{ ...mentions[0], type: 0 }]);
    expect(JSON.parse(requests[0].params.textProperties as string)).toEqual({ styles, ver: 0 });
    expect(requests[1].params).not.toHaveProperty("mentionInfo");
});
