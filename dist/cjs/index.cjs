'use strict';

var ZaloApiError = require('./Errors/ZaloApiError.cjs');
var Enum = require('./models/Enum.cjs');
var FriendEvent = require('./models/FriendEvent.cjs');
var GroupEvent = require('./models/GroupEvent.cjs');
var Message = require('./models/Message.cjs');
var Reaction = require('./models/Reaction.cjs');
var Typing = require('./models/Typing.cjs');
var Undo = require('./models/Undo.cjs');
var zalo = require('./zalo.cjs');
var sendReport = require('./apis/sendReport.cjs');
var listen = require('./apis/listen.cjs');
var sendMessage = require('./apis/sendMessage.cjs');
var loginQR = require('./apis/loginQR.cjs');



exports.ZaloApiError = ZaloApiError.ZaloApiError;
Object.defineProperty(exports, "DestType", {
	enumerable: true,
	get: function () { return Enum.DestType; }
});
Object.defineProperty(exports, "ThreadType", {
	enumerable: true,
	get: function () { return Enum.ThreadType; }
});
Object.defineProperty(exports, "FriendEventType", {
	enumerable: true,
	get: function () { return FriendEvent.FriendEventType; }
});
exports.initializeFriendEvent = FriendEvent.initializeFriendEvent;
Object.defineProperty(exports, "GroupEventType", {
	enumerable: true,
	get: function () { return GroupEvent.GroupEventType; }
});
exports.initializeGroupEvent = GroupEvent.initializeGroupEvent;
exports.GroupMessage = Message.GroupMessage;
exports.UserMessage = Message.UserMessage;
exports.Reaction = Reaction.Reaction;
Object.defineProperty(exports, "Reactions", {
	enumerable: true,
	get: function () { return Reaction.Reactions; }
});
exports.GroupTyping = Typing.GroupTyping;
exports.UserTyping = Typing.UserTyping;
exports.Undo = Undo.Undo;
exports.API = zalo.API;
exports.Zalo = zalo.Zalo;
Object.defineProperty(exports, "ReportReason", {
	enumerable: true,
	get: function () { return sendReport.ReportReason; }
});
Object.defineProperty(exports, "CloseReason", {
	enumerable: true,
	get: function () { return listen.CloseReason; }
});
Object.defineProperty(exports, "TextStyle", {
	enumerable: true,
	get: function () { return sendMessage.TextStyle; }
});
Object.defineProperty(exports, "Urgency", {
	enumerable: true,
	get: function () { return sendMessage.Urgency; }
});
Object.defineProperty(exports, "LoginQRCallbackEventType", {
	enumerable: true,
	get: function () { return loginQR.LoginQRCallbackEventType; }
});
