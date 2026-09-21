'use strict';

var ZaloApiError = require('./Errors/ZaloApiError.cjs');
var ZaloApiMissingImageMetadataGetter = require('./Errors/ZaloApiMissingImageMetadataGetter.cjs');
var ZaloApiLoginQRAborted = require('./Errors/ZaloApiLoginQRAborted.cjs');
var ZaloApiLoginQRDeclined = require('./Errors/ZaloApiLoginQRDeclined.cjs');
var AutoReply = require('./models/AutoReply.cjs');
var Bank = require('./models/Bank.cjs');
var Board = require('./models/Board.cjs');
var DeliveredMessage = require('./models/DeliveredMessage.cjs');
var Enum = require('./models/Enum.cjs');
var FriendEvent = require('./models/FriendEvent.cjs');
var Group = require('./models/Group.cjs');
var GroupEvent = require('./models/GroupEvent.cjs');
var Message = require('./models/Message.cjs');
var Reaction = require('./models/Reaction.cjs');
var Reminder = require('./models/Reminder.cjs');
var SeenMessage = require('./models/SeenMessage.cjs');
var Typing = require('./models/Typing.cjs');
var Undo = require('./models/Undo.cjs');
var ZBusiness = require('./models/ZBusiness.cjs');
var zalo = require('./zalo.cjs');
var listen = require('./apis/listen.cjs');
var loginQR = require('./apis/loginQR.cjs');
var getFriendRecommendations = require('./apis/getFriendRecommendations.cjs');
var reviewPendingMemberRequest = require('./apis/reviewPendingMemberRequest.cjs');
var sendMessage = require('./apis/sendMessage.cjs');
var sendReport = require('./apis/sendReport.cjs');
var setMute = require('./apis/setMute.cjs');
var updateAutoDeleteChat = require('./apis/updateAutoDeleteChat.cjs');
var updateLang = require('./apis/updateLang.cjs');
var updateSettings = require('./apis/updateSettings.cjs');
var apis = require('./apis.cjs');



exports.ZaloApiError = ZaloApiError.ZaloApiError;
exports.ZaloApiMissingImageMetadataGetter = ZaloApiMissingImageMetadataGetter.ZaloApiMissingImageMetadataGetter;
exports.ZaloApiLoginQRAborted = ZaloApiLoginQRAborted.ZaloApiLoginQRAborted;
exports.ZaloApiLoginQRDeclined = ZaloApiLoginQRDeclined.ZaloApiLoginQRDeclined;
Object.defineProperty(exports, "AutoReplyScope", {
	enumerable: true,
	get: function () { return AutoReply.AutoReplyScope; }
});
Object.defineProperty(exports, "BinBankCard", {
	enumerable: true,
	get: function () { return Bank.BinBankCard; }
});
Object.defineProperty(exports, "BoardType", {
	enumerable: true,
	get: function () { return Board.BoardType; }
});
exports.GroupDeliveredMessage = DeliveredMessage.GroupDeliveredMessage;
exports.UserDeliveredMessage = DeliveredMessage.UserDeliveredMessage;
Object.defineProperty(exports, "AvatarSize", {
	enumerable: true,
	get: function () { return Enum.AvatarSize; }
});
Object.defineProperty(exports, "DestType", {
	enumerable: true,
	get: function () { return Enum.DestType; }
});
Object.defineProperty(exports, "Gender", {
	enumerable: true,
	get: function () { return Enum.Gender; }
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
Object.defineProperty(exports, "GroupTopicType", {
	enumerable: true,
	get: function () { return Group.GroupTopicType; }
});
Object.defineProperty(exports, "GroupType", {
	enumerable: true,
	get: function () { return Group.GroupType; }
});
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
Object.defineProperty(exports, "ReminderRepeatMode", {
	enumerable: true,
	get: function () { return Reminder.ReminderRepeatMode; }
});
exports.GroupSeenMessage = SeenMessage.GroupSeenMessage;
exports.UserSeenMessage = SeenMessage.UserSeenMessage;
exports.GroupTyping = Typing.GroupTyping;
exports.UserTyping = Typing.UserTyping;
exports.Undo = Undo.Undo;
Object.defineProperty(exports, "BusinessCategory", {
	enumerable: true,
	get: function () { return ZBusiness.BusinessCategory; }
});
exports.BusinessCategoryName = ZBusiness.BusinessCategoryName;
exports.Zalo = zalo.Zalo;
Object.defineProperty(exports, "CloseReason", {
	enumerable: true,
	get: function () { return listen.CloseReason; }
});
Object.defineProperty(exports, "LoginQRCallbackEventType", {
	enumerable: true,
	get: function () { return loginQR.LoginQRCallbackEventType; }
});
Object.defineProperty(exports, "FriendRecommendationsType", {
	enumerable: true,
	get: function () { return getFriendRecommendations.FriendRecommendationsType; }
});
Object.defineProperty(exports, "ReviewPendingMemberRequestStatus", {
	enumerable: true,
	get: function () { return reviewPendingMemberRequest.ReviewPendingMemberRequestStatus; }
});
Object.defineProperty(exports, "TextStyle", {
	enumerable: true,
	get: function () { return sendMessage.TextStyle; }
});
Object.defineProperty(exports, "Urgency", {
	enumerable: true,
	get: function () { return sendMessage.Urgency; }
});
Object.defineProperty(exports, "ReportReason", {
	enumerable: true,
	get: function () { return sendReport.ReportReason; }
});
Object.defineProperty(exports, "MuteAction", {
	enumerable: true,
	get: function () { return setMute.MuteAction; }
});
Object.defineProperty(exports, "MuteDuration", {
	enumerable: true,
	get: function () { return setMute.MuteDuration; }
});
Object.defineProperty(exports, "ChatTTL", {
	enumerable: true,
	get: function () { return updateAutoDeleteChat.ChatTTL; }
});
Object.defineProperty(exports, "UpdateLangAvailableLanguages", {
	enumerable: true,
	get: function () { return updateLang.UpdateLangAvailableLanguages; }
});
Object.defineProperty(exports, "UpdateSettingsType", {
	enumerable: true,
	get: function () { return updateSettings.UpdateSettingsType; }
});
exports.API = apis.API;
