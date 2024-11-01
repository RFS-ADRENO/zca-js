import EventEmitter from "events";
import WebSocket from "ws";
import { appContext } from "../context.js";
import { type GroupEvent, initializeGroupEvent, TGroupEvent } from "../models/GroupEvent.js";
import { GroupMessage, Message, Reaction, Undo } from "../models/index.js";
import { decodeEventData, getGroupEventType, logger } from "../utils.js";
import { ZaloApiError } from "../Errors/ZaloApiError.js";

type MessageEventData = Message | GroupMessage;

type UploadEventData = {
    fileUrl: string;
    fileId: string;
};

export type OnMessageCallback = (message: MessageEventData) => void | Promise<void>;

interface ListenerEvents {
    connected: [];
    closed: [];
    error: [error: any];
    message: [message: MessageEventData];
    reaction: [reaction: Reaction];
    upload_attachment: [data: UploadEventData];
    undo: [data: Undo];
    group_event: [data: GroupEvent];
    cipher_key: [key: string];
}

export class Listener extends EventEmitter<ListenerEvents> {
    private url: string;
    private cookie: string;
    private userAgent: string;

    private ws: WebSocket | null;

    private onConnectedCallback: Function;
    private onClosedCallback: Function;
    private onErrorCallback: Function;
    private onMessageCallback: OnMessageCallback;
    private cipherKey?: string;

    private selfListen;
    private pingInterval?: Timer;

    constructor(url: string) {
        super();
        if (!appContext.cookie) throw new Error("Cookie is not available");
        if (!appContext.userAgent) throw new Error("User agent is not available");

        this.url = url;
        this.cookie = appContext.cookie;
        this.userAgent = appContext.userAgent;

        this.selfListen = appContext.options.selfListen;

        this.ws = null;

        this.onConnectedCallback = () => {};
        this.onClosedCallback = () => {};
        this.onErrorCallback = () => {};
        this.onMessageCallback = () => {};
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
        if (this.ws) throw new ZaloApiError("ALready started");
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
        this.ws = ws;

        ws.onopen = () => {
            this.onConnectedCallback();
            this.emit("connected");
        };

        ws.onclose = () => {
            this.onClosedCallback();
            this.emit("closed");
        };

        ws.onerror = (event) => {
            this.onErrorCallback(event);
            this.emit("error", event);
        };

        ws.onmessage = async (event) => {
            const { data } = event;
            if (!(data instanceof Buffer)) return;

            const encodedHeader = data.subarray(0, 4);
            const [version, cmd, subCmd] = getHeader(encodedHeader);

            try {
                const dataToDecode = data.subarray(4);
                const decodedData = new TextDecoder("utf-8").decode(dataToDecode);
                if (decodedData.length == 0) return;

                const parsed = JSON.parse(decodedData);

                if (version == 1 && cmd == 1 && subCmd == 1 && parsed.hasOwnProperty("key")) {
                    this.cipherKey = parsed.key;
                    this.emit("cipher_key", parsed.key);

                    if (this.pingInterval) clearInterval(this.pingInterval);

                    const ping = () => {
                        const payload = {
                            version: 1,
                            cmd: 2,
                            subCmd: 1,
                            data: { eventId: Date.now() },
                        };
                        const encodedData = new TextEncoder().encode(JSON.stringify(payload.data));
                        const dataLength = encodedData.length;

                        const data = new DataView(Buffer.alloc(4 + dataLength).buffer);
                        data.setUint8(0, payload.version);
                        data.setInt32(1, payload.cmd, true);
                        data.setInt8(3, payload.subCmd);

                        encodedData.forEach((e, i) => {
                            data.setUint8(4 + i, e);
                        });

                        ws.send(data);
                    };

                    this.pingInterval = setInterval(
                        () => {
                            ping();
                        },
                        3 * 60 * 1000,
                    );
                }

                if (version == 1 && cmd == 501 && subCmd == 0) {
                    const parsedData = (await decodeEventData(parsed, this.cipherKey)).data;
                    const { msgs } = parsedData;
                    for (const msg of msgs) {
                        if (typeof msg.content == "object" && msg.content.hasOwnProperty("deleteMsg")) {
                            const undoObject = new Undo(msg, false);
                            if (undoObject.isSelf && !this.selfListen) continue;
                            this.emit("undo", undoObject);
                        } else {
                            const messageObject = new Message(msg);
                            if (messageObject.isSelf && !this.selfListen) continue;
                            this.onMessageCallback(messageObject);
                            this.emit("message", messageObject);
                        }
                    }
                }

                if (version == 1 && cmd == 521 && subCmd == 0) {
                    const parsedData = (await decodeEventData(parsed, this.cipherKey)).data;
                    const { groupMsgs } = parsedData;
                    for (const msg of groupMsgs) {
                        if (typeof msg.content == "object" && msg.content.hasOwnProperty("deleteMsg")) {
                            const undoObject = new Undo(msg, true);
                            if (undoObject.isSelf && !this.selfListen) continue;
                            this.emit("undo", undoObject);
                        } else {
                            const messageObject = new GroupMessage(msg);
                            if (messageObject.isSelf && !this.selfListen) continue;
                            this.onMessageCallback(messageObject);
                            this.emit("message", messageObject);
                        }
                    }
                }

                if (version == 1 && cmd == 601 && subCmd == 0) {
                    const parsedData = (await decodeEventData(parsed, this.cipherKey)).data;
                    const { controls } = parsedData;
                    for (const control of controls) {
                        if (control.content.act_type == "file_done") {
                            const data = {
                                fileUrl: control.content.data.url,
                                fileId: control.content.fileId,
                            };

                            const uploadCallback = appContext.uploadCallbacks.get(String(control.content.fileId));
                            if (uploadCallback) uploadCallback(data);
                            appContext.uploadCallbacks.delete(String(control.content.fileId));

                            this.emit("upload_attachment", data);
                        } else if (control.content.act_type == "group") {
                            // 31/08/2024
                            // for some reason, Zalo send both join and join_reject event when admin approve join requests
                            // Zalo itself doesn't seem to handle this properly either, so we gonna ignore the join_reject event

                            if (control.content.act == "join_reject") continue;

                            const groupEventData: TGroupEvent =
                                typeof control.content.data == "string"
                                    ? JSON.parse(control.content.data)
                                    : control.content.data;

                            const groupEvent = initializeGroupEvent(
                                groupEventData,
                                getGroupEventType(control.content.act),
                            );
                            if (groupEvent.isSelf && !this.selfListen) continue;
                            this.emit("group_event", groupEvent);
                        }
                    }
                }

                if (cmd == 612) {
                    const parsedData = (await decodeEventData(parsed, this.cipherKey)).data;
                    const { reacts, reactGroups } = parsedData;

                    for (const react of reacts) {
                        react.content = JSON.parse(react.content);
                        const reactionObject = new Reaction(react, false);
                        if (reactionObject.isSelf && !this.selfListen) continue;

                        this.emit("reaction", reactionObject);
                    }

                    for (const reactGroup of reactGroups) {
                        reactGroup.content = JSON.parse(reactGroup.content);
                        const reactionObject = new Reaction(reactGroup, true);
                        if (reactionObject.isSelf && !this.selfListen) continue;

                        this.emit("reaction", reactionObject);
                    }
                }

                if (version == 1 && cmd == 3000 && subCmd == 0) {
                    console.log();
                    logger.error("Another connection is opened, closing this one");
                    console.log();
                    if (ws.readyState !== WebSocket.CLOSED) ws.close();
                }
            } catch (error) {
                this.onErrorCallback(error);
                this.emit("error", error);
            }
        };
    }

    public stop() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }
}

function getHeader(buffer: Buffer) {
    if (buffer.byteLength < 4) {
        throw new Error("Invalid header");
    }

    return [buffer[0], buffer.readUInt16LE(1), buffer[3]];
}
