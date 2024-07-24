import { decodeBase64ToBuffer, decodeUnit8Array } from "../utils.js";
import WebSocket from "ws";
import pako from "pako";
import { appContext } from "../context.js";
import { Message, MessageType, GroupMessage } from "../models/Message.js";

export type ListenerOptions = {
    selfListen: boolean;
};

export type OnMessageCallback = (message:
    {
        type: "message",
        data: Message
    } | {
        type: "group_message",
        data: GroupMessage
    }) => void | Promise<void>;

export class ListenerBase {
    private options: ListenerOptions;
    private url: string;
    private cookie: string;
    private userAgent: string;

    private onConnectedCallback: Function;
    private onClosedCallback: Function;
    private onErrorCallback: Function;
    private onMessageCallback: OnMessageCallback;
    private cipherKey?: string;

    constructor(url: string, options?: ListenerOptions) {
        if (!appContext.cookie) throw new Error("Cookie is not available");
        if (!appContext.userAgent) throw new Error("User agent is not available");

        this.options = options || { selfListen: false };
        this.url = url;
        this.cookie = appContext.cookie;
        this.userAgent = appContext.userAgent;

        this.onConnectedCallback = () => { };
        this.onClosedCallback = () => { };
        this.onErrorCallback = () => { };
        this.onMessageCallback = () => { };
    }

    public onConnected(cb: Function) {
        this.onConnectedCallback = cb;
    }

    public onClosed(cb: Function) {
        this.onClosedCallback = cb;
    }

    public onError(cb: Function) {
        this.onErrorCallback = cb;
    }

    public onMessage(cb: OnMessageCallback) {
        this.onMessageCallback = cb;
    }

    public start() {
        const ws = new WebSocket(this.url, {
            headers: {
                "accept-encoding": "gzip, deflate, br, zstd",
                "accept-language": "en-US,en;q=0.9",
                "cache-control": "no-cache",
                connection: "Upgrade",
                host: new URL(this.url).host,
                origin: "https://chat.zalo.me",
                prgama: "no-cache",
                "sec-websocket-extensions": "permessage-deflate; client_max_window_bits",
                "sec-websocket-version": "13",
                upgrade: "websocket",
                "user-agent": this.userAgent,
                cookie: this.cookie,
            },
        });

        ws.onopen = () => {
            this.onConnectedCallback();
        };

        ws.onclose = () => {
            this.onClosedCallback();
        };

        ws.onmessage = async (event) => {
            const { data } = event;
            if (!(data instanceof Buffer)) return;

            const encodedHeader = data.subarray(0, 4);
            const [n, a, s] = getHeader(encodedHeader); // what is n, a, s?
            console.log("Header:", n, a, s);

            try {
                const dataToDecode = data.subarray(4);
                const decodedData = new TextDecoder("utf-8").decode(dataToDecode);
                if (decodedData.length == 0) return;

                const parsed = JSON.parse(decodedData);

                if (n == 1 && a == 1 && s == 1 && parsed.hasOwnProperty("key")) {
                    this.cipherKey = parsed.key;
                }

                if (n == 1 && a == 501 && s == 0) {
                    if (!this.cipherKey) return;

                    const eventData = parsed.data;
                    const decodedEventDataBuffer = decodeBase64ToBuffer(
                        decodeURIComponent(eventData)
                    );

                    if (decodedEventDataBuffer.length >= 48) {
                        const algorithm = {
                            name: "AES-GCM",
                            iv: decodedEventDataBuffer.subarray(0, 16),
                            tagLength: 128,
                            additionalData: decodedEventDataBuffer.subarray(16, 32),
                        };
                        const dataSource = decodedEventDataBuffer.subarray(32);

                        const cryptoKey = await crypto.subtle.importKey(
                            "raw",
                            decodeBase64ToBuffer(this.cipherKey),
                            algorithm,
                            false,
                            ["decrypt"]
                        );
                        const decryptedData = await crypto.subtle.decrypt(
                            algorithm,
                            cryptoKey,
                            dataSource
                        );
                        const decompressedData = pako.inflate(decryptedData);
                        const decodedData = decodeUnit8Array(decompressedData);

                        if (!decodedData) return;
                        const parsedData = JSON.parse(decodedData).data;
                        const { msgs } = parsedData;
                        for (const msg of msgs) {
                            if (msg.idTo == "0" && !this.options.selfListen) continue;
                            this.onMessageCallback(
                                {
                                    type: "message",
                                    data: new Message(
                                        msg.actionId,
                                        msg.msgId,
                                        msg.cliMsgId,
                                        msg.msgType,
                                        msg.idTo == "0" ? appContext.uid : msg.idTo,
                                        msg.uidFrom == "0" ? appContext.uid : msg.uidFrom,
                                        msg.dName,
                                        msg.ts,
                                        msg.status,
                                        msg.content,
                                        msg.notify,
                                        msg.ttl,
                                        msg.userId,
                                        msg.uin,
                                        msg.topOut,
                                        msg.topOutTimeOut,
                                        msg.topOutImprTimeOut,
                                        msg.propertyExt,
                                        msg.paramsExt,
                                        msg.cmd,
                                        msg.st,
                                        msg.at,
                                        msg.realMsgId
                                    )
                                }
                            );
                        }
                    }
                }

                if (n == 1 && a == 521 && s == 0) {
                    if (!this.cipherKey) return;

                    const eventData = parsed.data;
                    const decodedEventDataBuffer = decodeBase64ToBuffer(
                        decodeURIComponent(eventData)
                    );

                    if (decodedEventDataBuffer.length >= 48) {
                        const algorithm = {
                            name: "AES-GCM",
                            iv: decodedEventDataBuffer.subarray(0, 16),
                            tagLength: 128,
                            additionalData: decodedEventDataBuffer.subarray(16, 32),
                        };
                        const dataSource = decodedEventDataBuffer.subarray(32);

                        const cryptoKey = await crypto.subtle.importKey(
                            "raw",
                            decodeBase64ToBuffer(this.cipherKey),
                            algorithm,
                            false,
                            ["decrypt"]
                        );
                        const decryptedData = await crypto.subtle.decrypt(
                            algorithm,
                            cryptoKey,
                            dataSource
                        );
                        const decompressedData = pako.inflate(decryptedData);
                        const decodedData = decodeUnit8Array(decompressedData);

                        if (!decodedData) return
                        const parsedData = JSON.parse(decodedData).data;
                        const { groupMsgs } = parsedData;
                        for (const msg of groupMsgs) {
                            this.onMessageCallback(
                                {
                                    type: "group_message",
                                    data: new GroupMessage(
                                        msg.actionId,
                                        msg.msgId,
                                        msg.cliMsgId,
                                        msg.msgType,
                                        msg.idTo,
                                        msg.uidFrom == "0" ? appContext.uid : msg.uidFrom,
                                        msg.dName,
                                        msg.ts,
                                        msg.status,
                                        msg.content,
                                        msg.notify,
                                        msg.ttl,
                                        msg.userId,
                                        msg.uin,
                                        msg.topOut,
                                        msg.topOutTimeOut,
                                        msg.topOutImprTimeOut,
                                        msg.propertyExt,
                                        msg.paramsExt,
                                        msg.cmd,
                                        msg.st,
                                        msg.at,
                                        msg.realMsgId,
                                        msg.mentions,
                                        msg.quote
                                    )
                                }
                            );
                        }
                    }
                }
            } catch (error) {
                this.onErrorCallback(error);
            }
        };
    }
}

function getHeader(buffer: Buffer) {
    if (buffer.byteLength < 4) {
        throw new Error("Invalid header");
    }

    const n = new DataView(buffer.buffer);
    return [n.getUint8(0), n.getUint16(1, true), n.getUint8(3)];
}
