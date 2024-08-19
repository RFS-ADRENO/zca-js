import EventEmitter from "events";
import WebSocket from "ws";
import { appContext } from "../context.js";
import { GroupMessage, Message, Reaction, Undo } from "../models/index.js";
import { decodeEventData, getGroupEventType, logger } from "../utils.js";
import { GroupEvent } from "../models/GroupEvent.js";

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
}

export class Listener extends EventEmitter<ListenerEvents> {
    private url: string;
    private cookie: string;
    private userAgent: string;

    private onConnectedCallback: Function;
    private onClosedCallback: Function;
    private onErrorCallback: Function;
    private onMessageCallback: OnMessageCallback;
    private cipherKey?: string;

    private selfListen;

    constructor(url: string) {
        super();
        if (!appContext.cookie) throw new Error("Cookie is not available");
        if (!appContext.userAgent) throw new Error("User agent is not available");

        this.url = url;
        this.cookie = appContext.cookie;
        this.userAgent = appContext.userAgent;

        this.selfListen = appContext.options.selfListen;

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
            this.emit("connected");
        };

        ws.onclose = () => {
            this.onClosedCallback();
            this.emit("closed");
        };

        ws.onmessage = async (event) => {
            const { data } = event;
            if (!(data instanceof Buffer)) return;

            const encodedHeader = data.subarray(0, 4);
            const [n, cmd, s] = getHeader(encodedHeader); // what is n, s?

            try {
                const dataToDecode = data.subarray(4);
                const decodedData = new TextDecoder("utf-8").decode(dataToDecode);
                if (decodedData.length == 0) return;

                const parsed = JSON.parse(decodedData);

                if (n == 1 && cmd == 1 && s == 1 && parsed.hasOwnProperty("key")) {
                    this.cipherKey = parsed.key;
                }

                if (n == 1 && cmd == 501 && s == 0) {
                    const parsedData = (await decodeEventData(parsed, this.cipherKey)).data;
                    const { msgs } = parsedData;
                    for (const msg of msgs) {
                        if (msg.at == 0) {
                            const messageObject = new Message(msg);
                            if (messageObject.isSelf && !this.selfListen) continue;
                            this.onMessageCallback(messageObject);
                            this.emit("message", messageObject);
                        } else {
                            const undoObject = new Undo(msg, false);
                            if (undoObject.isSelf && !this.selfListen) continue;
                            this.emit("undo", undoObject);
                        }
                    }
                }

                if (n == 1 && cmd == 521 && s == 0) {
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

                if (n == 1 && cmd == 601 && s == 0) {
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
                            const groupEvent = new GroupEvent(
                                JSON.parse(control.content.data),
                                getGroupEventType(control.content.act),
                            );
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

                        this.emit("reaction", reactionObject);
                    }

                    for (const reactGroup of reactGroups) {
                        reactGroup.content = JSON.parse(reactGroup.content);
                        const reactionObject = new Reaction(reactGroup, true);

                        this.emit("reaction", reactionObject);
                    }
                }

                if (n == 1 && cmd == 3000 && s == 0) {
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
}

function getHeader(buffer: Buffer) {
    if (buffer.byteLength < 4) {
        throw new Error("Invalid header");
    }

    return [buffer[0], buffer.readUInt16LE(1), buffer[3]];
}
