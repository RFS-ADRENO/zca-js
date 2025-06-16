'use strict';

var EventEmitter = require('events');
var WebSocket = require('ws');
var GroupEvent = require('../models/GroupEvent.cjs');
var FriendEvent = require('../models/FriendEvent.cjs');
var Enum = require('../models/Enum.cjs');
var Message = require('../models/Message.cjs');
var Reaction = require('../models/Reaction.cjs');
var Typing = require('../models/Typing.cjs');
var Undo = require('../models/Undo.cjs');
var utils = require('../utils.cjs');
var ZaloApiError = require('../Errors/ZaloApiError.cjs');
var SeenMessage = require('../models/SeenMessage.cjs');
var DeliveredMessage = require('../models/DeliveredMessage.cjs');

exports.CloseReason = void 0;
(function (CloseReason) {
    CloseReason[CloseReason["ManualClosure"] = 1000] = "ManualClosure";
    CloseReason[CloseReason["DuplicateConnection"] = 3000] = "DuplicateConnection";
    CloseReason[CloseReason["KickConnection"] = 3003] = "KickConnection";
})(exports.CloseReason || (exports.CloseReason = {}));
class Listener extends EventEmitter {
    constructor(ctx, urls) {
        super();
        this.ctx = ctx;
        this.urls = urls;
        this.id = 0;
        if (!ctx.cookie)
            throw new ZaloApiError.ZaloApiError("Cookie is not available");
        if (!ctx.userAgent)
            throw new ZaloApiError.ZaloApiError("User agent is not available");
        this.wsURL = utils.makeURL(this.ctx, this.urls[0], {
            t: Date.now(),
        });
        this.retryCount = {};
        this.rotateCount = 0;
        for (const retry in ctx.settings.features.socket.retries) {
            const { times, max } = ctx.settings.features.socket.retries[retry];
            this.retryCount[retry] = {
                count: 0,
                max: max || 0,
                times: typeof times === "number" ? [times] : times,
            };
        }
        this.cookie = ctx.cookie.getCookieStringSync("https://chat.zalo.me");
        this.userAgent = ctx.userAgent;
        this.selfListen = ctx.options.selfListen;
        this.ws = null;
        this.onConnectedCallback = () => { };
        this.onClosedCallback = () => { };
        this.onErrorCallback = () => { };
        this.onMessageCallback = () => { };
    }
    /**
     * @deprecated Use `on` method instead
     */
    onConnected(cb) {
        this.onConnectedCallback = cb;
    }
    /**
     * @deprecated Use `on` method instead
     */
    onClosed(cb) {
        this.onClosedCallback = cb;
    }
    /**
     * @deprecated Use `on` method instead
     */
    onError(cb) {
        this.onErrorCallback = cb;
    }
    /**
     * @deprecated Use `on` method instead
     */
    onMessage(cb) {
        this.onMessageCallback = cb;
    }
    canRetry(code) {
        if (!this.ctx.settings.features.socket.close_and_retry_codes.includes(code))
            return false;
        if (this.retryCount[code.toString()].count >= this.retryCount[code.toString()].max)
            return false;
        this.retryCount[code.toString()].count++;
        const { count, max, times } = this.retryCount[code.toString()];
        const retryTime = count - 1 < times.length ? times[count - 1] : times[times.length - 1];
        utils.logger(this.ctx).verbose(`Retry for code ${code} in ${retryTime}ms (${count}/${max})`);
        return retryTime;
    }
    shouldRotate(code) {
        if (!this.ctx.settings.features.socket.rotate_error_codes.includes(code))
            return false;
        if (this.rotateCount >= this.urls.length - 1)
            return false;
        return true;
    }
    rotateEndpoint() {
        this.rotateCount++;
        this.wsURL = utils.makeURL(this.ctx, this.urls[this.rotateCount], {
            t: Date.now(),
        });
        utils.logger(this.ctx).verbose(`Rotating endpoint to ${this.wsURL}`);
    }
    start({ retryOnClose = false } = {}) {
        if (this.ws)
            throw new ZaloApiError.ZaloApiError("Already started");
        const ws = new WebSocket(this.wsURL, {
            headers: {
                "accept-encoding": "gzip, deflate, br, zstd",
                "accept-language": "en-US,en;q=0.9",
                "cache-control": "no-cache",
                connection: "Upgrade",
                host: new URL(this.wsURL).host,
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
        ws.onclose = (event) => {
            this.reset();
            this.emit("disconnected", event.code);
            const retry = retryOnClose && this.canRetry(event.code);
            if (retry && retryOnClose) {
                const shouldRotate = this.shouldRotate(event.code);
                if (shouldRotate) {
                    this.rotateEndpoint();
                }
                setTimeout(() => {
                    this.start({ retryOnClose: true });
                }, retry);
            }
            else {
                this.onClosedCallback(event.code);
                this.emit("closed", event.code);
            }
        };
        ws.onerror = (event) => {
            this.onErrorCallback(event);
            this.emit("error", event);
        };
        ws.onmessage = async (event) => {
            const { data } = event;
            if (!(data instanceof Buffer))
                return;
            const encodedHeader = data.subarray(0, 4);
            const [version, cmd, subCmd] = getHeader(encodedHeader);
            try {
                const dataToDecode = data.subarray(4);
                const decodedData = new TextDecoder("utf-8").decode(dataToDecode);
                if (decodedData.length == 0)
                    return;
                const parsed = JSON.parse(decodedData);
                if (version == 1 && cmd == 1 && subCmd == 1 && parsed.hasOwnProperty("key")) {
                    this.cipherKey = parsed.key;
                    this.emit("cipher_key", parsed.key);
                    if (this.pingInterval)
                        clearInterval(this.pingInterval);
                    const ping = () => {
                        const payload = {
                            version: 1,
                            cmd: 2,
                            subCmd: 1,
                            data: { eventId: Date.now() },
                        };
                        this.sendWs(payload, false);
                    };
                    this.pingInterval = setInterval(() => {
                        ping();
                    }, this.ctx.settings.features.socket.ping_interval);
                }
                if (version == 1 && cmd == 501 && subCmd == 0) {
                    const parsedData = (await utils.decodeEventData(parsed, this.cipherKey)).data;
                    const { msgs } = parsedData;
                    for (const msg of msgs) {
                        if (typeof msg.content == "object" && msg.content.hasOwnProperty("deleteMsg")) {
                            const undoObject = new Undo.Undo(this.ctx.uid, msg, false);
                            if (undoObject.isSelf && !this.selfListen)
                                continue;
                            this.emit("undo", undoObject);
                        }
                        else {
                            const messageObject = new Message.UserMessage(this.ctx.uid, msg);
                            if (messageObject.isSelf && !this.selfListen)
                                continue;
                            this.onMessageCallback(messageObject);
                            this.emit("message", messageObject);
                        }
                    }
                }
                if (version == 1 && cmd == 521 && subCmd == 0) {
                    const parsedData = (await utils.decodeEventData(parsed, this.cipherKey)).data;
                    const { groupMsgs } = parsedData;
                    for (const msg of groupMsgs) {
                        if (typeof msg.content == "object" && msg.content.hasOwnProperty("deleteMsg")) {
                            const undoObject = new Undo.Undo(this.ctx.uid, msg, true);
                            if (undoObject.isSelf && !this.selfListen)
                                continue;
                            this.emit("undo", undoObject);
                        }
                        else {
                            const messageObject = new Message.GroupMessage(this.ctx.uid, msg);
                            if (messageObject.isSelf && !this.selfListen)
                                continue;
                            this.onMessageCallback(messageObject);
                            this.emit("message", messageObject);
                        }
                    }
                }
                if (version == 1 && cmd == 601 && subCmd == 0) {
                    const parsedData = (await utils.decodeEventData(parsed, this.cipherKey)).data;
                    const { controls } = parsedData;
                    for (const control of controls) {
                        if (control.content.act_type == "file_done") {
                            const data = {
                                fileUrl: control.content.data.url,
                                fileId: control.content.fileId,
                            };
                            const uploadCallback = this.ctx.uploadCallbacks.get(String(control.content.fileId));
                            if (uploadCallback)
                                uploadCallback(data);
                            this.ctx.uploadCallbacks.delete(String(control.content.fileId));
                            this.emit("upload_attachment", data);
                        }
                        else if (control.content.act_type == "group") {
                            // 31/08/2024
                            // for some reason, Zalo send both join and join_reject event when admin approve join requests
                            // Zalo itself doesn't seem to handle this properly either, so we gonna ignore the join_reject event
                            if (control.content.act == "join_reject")
                                continue;
                            const groupEventData = typeof control.content.data == "string"
                                ? JSON.parse(control.content.data)
                                : control.content.data;
                            const groupEvent = GroupEvent.initializeGroupEvent(this.ctx.uid, groupEventData, utils.getGroupEventType(control.content.act));
                            if (groupEvent.isSelf && !this.selfListen)
                                continue;
                            this.emit("group_event", groupEvent);
                        }
                        else if (control.content.act_type == "fr") {
                            // 28/02/2025
                            // Zalo send both req and req_v2 event when user send friend request
                            // Zalo itself doesn't seem to handle this properly either, so we gonna ignore the req event
                            if (control.content.act == "req")
                                continue;
                            const friendEventData = typeof control.content.data == "string"
                                ? JSON.parse(control.content.data)
                                : control.content.data;
                            // Handles the case when act is "pin_create" and params is a string
                            if (typeof friendEventData == "object" &&
                                "topic" in friendEventData &&
                                typeof friendEventData.topic == "object" &&
                                "params" in friendEventData.topic) {
                                friendEventData.topic.params = JSON.parse(`${friendEventData.topic.params}`);
                            }
                            const friendEvent = FriendEvent.initializeFriendEvent(this.ctx.uid, typeof friendEventData == "number" ? control.content.data : friendEventData, utils.getFriendEventType(control.content.act));
                            if (friendEvent.isSelf && !this.selfListen)
                                continue;
                            this.emit("friend_event", friendEvent);
                        }
                    }
                }
                if (cmd == 612) {
                    const parsedData = (await utils.decodeEventData(parsed, this.cipherKey)).data;
                    const { reacts, reactGroups } = parsedData;
                    for (const react of reacts) {
                        react.content = JSON.parse(react.content);
                        const reactionObject = new Reaction.Reaction(this.ctx.uid, react, false);
                        if (reactionObject.isSelf && !this.selfListen)
                            continue;
                        this.emit("reaction", reactionObject);
                    }
                    for (const reactGroup of reactGroups) {
                        reactGroup.content = JSON.parse(reactGroup.content);
                        const reactionObject = new Reaction.Reaction(this.ctx.uid, reactGroup, true);
                        if (reactionObject.isSelf && !this.selfListen)
                            continue;
                        this.emit("reaction", reactionObject);
                    }
                }
                if (cmd == 610 || cmd == 611) {
                    const parsedData = (await utils.decodeEventData(parsed, this.cipherKey)).data;
                    const isGroup = cmd == 611;
                    const reacts = parsedData[isGroup ? "reactGroups" : "reacts"];
                    const reactionObjects = reacts.map((react) => new Reaction.Reaction(this.ctx.uid, react, isGroup));
                    this.emit("old_reactions", reactionObjects, isGroup);
                }
                if (cmd == 510 && subCmd == 1) {
                    const parsedData = (await utils.decodeEventData(parsed, this.cipherKey)).data;
                    const { msgs } = parsedData;
                    const responseMsgs = msgs.map((msg) => new Message.UserMessage(this.ctx.uid, msg));
                    this.emit("old_messages", responseMsgs, Enum.ThreadType.User);
                }
                if (cmd == 511 && subCmd == 1) {
                    const parsedData = (await utils.decodeEventData(parsed, this.cipherKey)).data;
                    const { groupMsgs } = parsedData;
                    const responseMsgs = groupMsgs.map((msg) => new Message.GroupMessage(this.ctx.uid, msg));
                    this.emit("old_messages", responseMsgs, Enum.ThreadType.Group);
                }
                if (cmd == 602 && subCmd == 0) {
                    const parsedData = (await utils.decodeEventData(parsed, this.cipherKey)).data;
                    const { actions } = parsedData;
                    for (const action of actions) {
                        if (!action.data)
                            continue;
                        const data = JSON.parse(`{${action.data}}`);
                        if (action.act_type == "typing") {
                            if (action.act == "typing") {
                                const typingObject = new Typing.UserTyping(data);
                                this.emit("typing", typingObject);
                            }
                            else if (action.act == "gtyping") {
                                // 26/02/2025
                                // For a group with only two people, Zalo doesn't send a typing event.
                                const typingObject = new Typing.GroupTyping(data);
                                this.emit("typing", typingObject);
                            }
                        }
                    }
                }
                if (cmd == 502 && subCmd == 0) {
                    const parsedData = (await utils.decodeEventData(parsed, this.cipherKey)).data;
                    const { delivereds: deliveredMsgs, seens: seenMsgs } = parsedData;
                    if (Array.isArray(deliveredMsgs) && deliveredMsgs.length > 0) {
                        let deliveredObjects = deliveredMsgs.map((delivered) => new DeliveredMessage.UserDeliveredMessage(delivered));
                        this.emit("delivered_messages", deliveredObjects);
                    }
                    if (Array.isArray(seenMsgs) && seenMsgs.length > 0) {
                        let seenObjects = seenMsgs.map((seen) => new SeenMessage.UserSeenMessage(seen));
                        this.emit("seen_messages", seenObjects);
                    }
                }
                if (cmd == 522 && subCmd == 0) {
                    const parsedData = (await utils.decodeEventData(parsed, this.cipherKey)).data;
                    const { delivereds: deliveredMsgs, groupSeens: groupSeenMsgs } = parsedData;
                    if (Array.isArray(deliveredMsgs) && deliveredMsgs.length > 0) {
                        let deliveredObjects = deliveredMsgs.map((delivered) => new DeliveredMessage.GroupDeliveredMessage(this.ctx.uid, delivered));
                        if (!this.selfListen)
                            deliveredObjects = deliveredObjects.filter((delivered) => !delivered.isSelf);
                        this.emit("delivered_messages", deliveredObjects);
                    }
                    if (Array.isArray(groupSeenMsgs) && groupSeenMsgs.length > 0) {
                        let seenObjects = groupSeenMsgs.map((seen) => new SeenMessage.GroupSeenMessage(this.ctx.uid, seen));
                        if (!this.selfListen)
                            seenObjects = seenObjects.filter((seen) => !seen.isSelf);
                        this.emit("seen_messages", seenObjects);
                    }
                }
                if (version == 1 && cmd == 3000 && subCmd == 0) {
                    console.log();
                    utils.logger(this.ctx).error("Another connection is opened, closing this one");
                    console.log();
                    if (ws.readyState !== WebSocket.CLOSED)
                        ws.close(exports.CloseReason.DuplicateConnection);
                }
            }
            catch (error) {
                this.onErrorCallback(error);
                this.emit("error", error);
            }
        };
    }
    stop() {
        if (this.ws) {
            this.ws.close(exports.CloseReason.ManualClosure);
            this.reset();
        }
    }
    sendWs(payload, requireId = true) {
        if (this.ws) {
            if (requireId)
                payload.data["req_id"] = `req_${this.id++}`;
            const encodedData = new TextEncoder().encode(JSON.stringify(payload.data));
            const dataLength = encodedData.length;
            const data = new DataView(Buffer.alloc(4 + dataLength).buffer);
            data.setUint8(0, payload.version);
            data.setInt32(1, payload.cmd, true);
            data.setInt8(3, payload.subCmd);
            encodedData.forEach((e, i) => {
                data.setUint8(4 + i, e);
            });
            this.ws.send(data);
        }
    }
    /**
     * Request old messages
     *
     * @param lastMsgId
     */
    requestOldMessages(threadType, lastMsgId = null) {
        const payload = {
            version: 1,
            cmd: threadType === Enum.ThreadType.User ? 510 : 511,
            subCmd: 1,
            data: { first: true, lastId: lastMsgId, preIds: [] },
        };
        this.sendWs(payload);
    }
    /**
     * Request old messages
     *
     * @param lastMsgId
     */
    requestOldReactions(threadType, lastMsgId = null) {
        const payload = {
            version: 1,
            cmd: threadType === Enum.ThreadType.User ? 610 : 611,
            subCmd: 1,
            data: { first: true, lastId: lastMsgId, preIds: [] },
        };
        this.sendWs(payload);
    }
    reset() {
        this.ws = null;
        this.cipherKey = undefined;
        if (this.pingInterval)
            clearInterval(this.pingInterval);
    }
}
function getHeader(buffer) {
    if (buffer.byteLength < 4) {
        throw new ZaloApiError.ZaloApiError("Invalid header");
    }
    return [buffer[0], buffer.readUInt16LE(1), buffer[3]];
}

exports.Listener = Listener;
