import { Listener } from "./apis/listen.js";
import { getServerInfo, login } from "./apis/login.js";
import { createContext, isContextSession, } from "./context.js";
import { generateZaloUUID, logger } from "./utils.js";
import toughCookie from "tough-cookie";
import { acceptFriendRequestFactory } from "./apis/acceptFriendRequest.js";
import { addGroupDeputyFactory } from "./apis/addGroupDeputy.js";
import { addHiddenConversPinFactory } from "./apis/addHiddenConversPin.js";
import { addQuickMessageFactory } from "./apis/addQuickMessage.js";
import { addReactionFactory } from "./apis/addReaction.js";
import { addUnreadMarkFactory } from "./apis/addUnreadMark.js";
import { addUserToGroupFactory } from "./apis/addUserToGroup.js";
import { autoDeleteChatFactory } from "./apis/autoDeleteChat.js";
import { blockUserFactory } from "./apis/blockUser.js";
import { blockViewFeedFactory } from "./apis/blockViewFeed.js";
import { changeAccountAvatarFactory } from "./apis/changeAccountAvatar.js";
import { changeFriendAliasFactory } from "./apis/changeFriendAlias.js";
import { changeGroupAvatarFactory } from "./apis/changeGroupAvatar.js";
import { changeGroupNameFactory } from "./apis/changeGroupName.js";
import { changeGroupOwnerFactory } from "./apis/changeGroupOwner.js";
import { createGroupFactory } from "./apis/createGroup.js";
import { createNoteGroupFactory } from "./apis/createNoteGroup.js";
import { createPollFactory } from "./apis/createPoll.js";
import { createReminderFactory } from "./apis/createReminder.js";
import { deleteAvatarListFactory } from "./apis/deleteAvatarList.js";
import { deleteChatFactory } from "./apis/deleteChat.js";
import { deleteMessageFactory } from "./apis/deleteMessage.js";
import { disableGroupLinkFactory } from "./apis/disableGroupLink.js";
import { disperseGroupFactory } from "./apis/disperseGroup.js";
import { editNoteGroupFactory } from "./apis/editNoteGroup.js";
import { editReminderFactory } from "./apis/editReminder.js";
import { enableGroupLinkFactory } from "./apis/enableGroupLink.js";
import { fetchAccountInfoFactory } from "./apis/fetchAccountInfo.js";
import { findUserFactory } from "./apis/findUser.js";
import { forwardMessageFactory } from "./apis/forwardMessage.js";
import { getAliasListFactory } from "./apis/getAliasList.js";
import { getAllFriendsFactory } from "./apis/getAllFriends.js";
import { getAllGroupsFactory } from "./apis/getAllGroups.js";
import { getArchivedChatListFactory } from "./apis/getArchivedChatList.js";
import { getAutoDeleteChatFactory } from "./apis/getAutoDeleteChat.js";
import { getAvatarListFactory } from "./apis/getAvatarList.js";
import { getBizAccountFactory } from "./apis/getBizAccount.js";
import { getContextFactory } from "./apis/getContext.js";
import { getCookieFactory } from "./apis/getCookie.js";
import { getFriendBoardListFactory } from "./apis/getFriendBoardList.js";
import { getFriendRequestFactory } from "./apis/getFriendRequest.js";
import { getRecommendRequestFactory } from "./apis/getRecommendRequest.js";
import { getGroupInfoFactory } from "./apis/getGroupInfo.js";
import { getGroupMembersInfoFactory } from "./apis/getGroupMembersInfo.js";
import { getHiddenConversPinFactory } from "./apis/getHiddenConversPin.js";
import { getLabelsFactory } from "./apis/getLabels.js";
import { getListPollFactory } from "./apis/getListPoll.js";
import { getListReminderFactory } from "./apis/getListReminder.js";
import { getMuteFactory } from "./apis/getMute.js";
import { getOwnIdFactory } from "./apis/getOwnId.js";
import { getPinConversationsFactory } from "./apis/getPinConversations.js";
import { getPollDetailFactory } from "./apis/getPollDetail.js";
import { getQRFactory } from "./apis/getQR.js";
import { getQuickMessageFactory } from "./apis/getQuickMessage.js";
import { getRecvFriendRequestFactory } from "./apis/getRecvFriendRequest.js";
import { getReminderFactory } from "./apis/getReminder.js";
import { getReminderEventFactory } from "./apis/getReminderEvent.js";
import { getStickersFactory } from "./apis/getStickers.js";
import { getStickersDetailFactory } from "./apis/getStickersDetail.js";
import { getUnreadMarkFactory } from "./apis/getUnreadMark.js";
import { getUserInfoFactory } from "./apis/getUserInfo.js";
import { inviteUserToGroupsFactory } from "./apis/inviteUserToGroups.js";
import { joinGroupFactory } from "./apis/joinGroup.js";
import { keepAliveFactory } from "./apis/keepAlive.js";
import { lastOnlineFactory } from "./apis/lastOnline.js";
import { leaveGroupFactory } from "./apis/leaveGroup.js";
import { linkGroupInfoFactory } from "./apis/linkGroupInfo.js";
import { lockPollFactory } from "./apis/lockPoll.js";
import { loginQR, LoginQRCallbackEventType } from "./apis/loginQR.js";
import { parseLinkFactory } from "./apis/parseLink.js";
import { pinConversationsFactory } from "./apis/pinConversations.js";
import { removeFriendFactory } from "./apis/removeFriend.js";
import { removeFriendAliasFactory } from "./apis/removeFriendAlias.js";
import { removeGroupDeputyFactory } from "./apis/removeGroupDeputy.js";
import { removeHiddenConversPinFactory } from "./apis/removeHiddenConversPin.js";
import { removeQuickMessageFactory } from "./apis/removeQuickMessage.js";
import { removeReminderFactory } from "./apis/removeReminder.js";
import { removeUnreadMarkFactory } from "./apis/removeUnreadMark.js";
import { removeUserFromGroupFactory } from "./apis/removeUserFromGroup.js";
import { resetHiddenConversPinFactory } from "./apis/resetHiddenConversPin.js";
import { reuseAvatarFactory } from "./apis/reuseAvatar.js";
import { sendCardFactory } from "./apis/sendCard.js";
import { sendDeliveredEventFactory } from "./apis/sendDeliveredEvent.js";
import { sendFriendRequestFactory } from "./apis/sendFriendRequest.js";
import { sendLinkFactory } from "./apis/sendLink.js";
import { sendMessageFactory } from "./apis/sendMessage.js";
import { sendReportFactory } from "./apis/sendReport.js";
import { sendSeenEventFactory } from "./apis/sendSeenEvent.js";
import { sendStickerFactory } from "./apis/sendSticker.js";
import { sendTypingEventFactory } from "./apis/sendTypingEvent.js";
import { sendVideoFactory } from "./apis/sendVideo.js";
import { sendVoiceFactory } from "./apis/sendVoice.js";
import { setMuteFactory } from "./apis/setMute.js";
import { unblockUserFactory } from "./apis/unblockUser.js";
import { undoFactory } from "./apis/undo.js";
import { undoFriendRequestFactory } from "./apis/undoFriendRequest.js";
import { updateAutoDeleteChatFactory } from "./apis/updateAutoDeleteChat.js";
import { updateGroupSettingsFactory } from "./apis/updateGroupSettings.js";
import { updateHiddenConversPinFactory } from "./apis/updateHiddenConversPin.js";
import { updateLabelsFactory } from "./apis/updateLabels.js";
import { updateLangFactory } from "./apis/updateLang.js";
import { updateProfileFactory } from "./apis/updateProfile.js";
import { updateQuickMessageFactory } from "./apis/updateQuickMessage.js";
import { updateSettingsFactory } from "./apis/updateSettings.js";
import { uploadAttachmentFactory } from "./apis/uploadAttachment.js";
import { ZaloApiError } from "./Errors/ZaloApiError.js";
import { checkUpdate } from "./update.js";
import { customFactory } from "./apis/custom.js";
export class Zalo {
    constructor(options = {}) {
        this.options = options;
        this.enableEncryptParam = true;
    }
    parseCookies(cookie) {
        var _a;
        const cookieArr = Array.isArray(cookie) ? cookie : cookie.cookies;
        cookieArr.forEach((e, i) => {
            if (typeof e.domain == "string" && e.domain.startsWith("."))
                cookieArr[i].domain = e.domain.slice(1);
        });
        const jar = new toughCookie.CookieJar();
        for (const each of cookieArr) {
            try {
                jar.setCookieSync((_a = toughCookie.Cookie.fromJSON(Object.assign(Object.assign({}, each), { key: each.key || each.name }))) !== null && _a !== void 0 ? _a : "", "https://chat.zalo.me");
            }
            catch (_b) { }
        }
        return jar;
    }
    validateParams(credentials) {
        if (!credentials.imei || !credentials.cookie || !credentials.userAgent) {
            throw new Error("Missing required params");
        }
    }
    async login(credentials) {
        const ctx = createContext(this.options.apiType, this.options.apiVersion);
        Object.assign(ctx.options, this.options);
        return this.loginCookie(ctx, credentials);
    }
    async loginCookie(ctx, credentials) {
        await checkUpdate(ctx);
        this.validateParams(credentials);
        ctx.imei = credentials.imei;
        ctx.cookie = this.parseCookies(credentials.cookie);
        ctx.userAgent = credentials.userAgent;
        ctx.language = credentials.language || "vi";
        const loginData = await login(ctx, this.enableEncryptParam);
        const serverInfo = await getServerInfo(ctx, this.enableEncryptParam);
        if (!loginData || !serverInfo)
            throw new Error("Đăng nhập thất bại");
        ctx.secretKey = loginData.data.zpw_enk;
        ctx.uid = loginData.data.uid;
        // Zalo currently responds with setttings instead of settings
        // they might fix this in the future, so we should have a fallback just in case
        ctx.settings = serverInfo.setttings || serverInfo.settings;
        ctx.extraVer = serverInfo.extra_ver;
        if (!isContextSession(ctx))
            throw new Error("Khởi tạo ngữ cảnh thát bại.");
        logger(ctx).info("Logged in as", loginData.data.uid);
        return new API(ctx, loginData.data.zpw_service_map_v3, loginData.data.zpw_ws);
    }
    async loginQR(options, callback) {
        if (!options)
            options = {};
        if (!options.userAgent)
            options.userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0";
        if (!options.language)
            options.language = "vi";
        const ctx = createContext(this.options.apiType, this.options.apiVersion);
        Object.assign(ctx.options, this.options);
        const loginQRResult = await loginQR(ctx, options, callback);
        if (!loginQRResult)
            throw new ZaloApiError("Unable to login with QRCode");
        const imei = generateZaloUUID(options.userAgent);
        if (callback) {
            // Thanks to @YanCastle for this great suggestion!
            callback({
                type: LoginQRCallbackEventType.GotLoginInfo,
                data: {
                    cookie: loginQRResult.cookies,
                    imei,
                    userAgent: options.userAgent,
                },
                actions: null,
            });
        }
        return this.loginCookie(ctx, {
            cookie: loginQRResult.cookies,
            imei,
            userAgent: options.userAgent,
            language: options.language,
        });
    }
}
export class API {
    constructor(ctx, zpwServiceMap, wsUrls) {
        this.zpwServiceMap = zpwServiceMap;
        this.listener = new Listener(ctx, wsUrls);
        this.acceptFriendRequest = acceptFriendRequestFactory(ctx, this);
        this.addGroupDeputy = addGroupDeputyFactory(ctx, this);
        this.addHiddenConversPin = addHiddenConversPinFactory(ctx, this);
        this.addQuickMessage = addQuickMessageFactory(ctx, this);
        this.addReaction = addReactionFactory(ctx, this);
        this.addUnreadMark = addUnreadMarkFactory(ctx, this);
        this.addUserToGroup = addUserToGroupFactory(ctx, this);
        this.autoDeleteChat = autoDeleteChatFactory(ctx, this);
        this.blockUser = blockUserFactory(ctx, this);
        this.blockViewFeed = blockViewFeedFactory(ctx, this);
        this.changeAccountAvatar = changeAccountAvatarFactory(ctx, this);
        this.changeFriendAlias = changeFriendAliasFactory(ctx, this);
        this.changeGroupAvatar = changeGroupAvatarFactory(ctx, this);
        this.changeGroupName = changeGroupNameFactory(ctx, this);
        this.changeGroupOwner = changeGroupOwnerFactory(ctx, this);
        this.createGroup = createGroupFactory(ctx, this);
        this.createNoteGroup = createNoteGroupFactory(ctx, this);
        this.createPoll = createPollFactory(ctx, this);
        this.createReminder = createReminderFactory(ctx, this);
        this.deleteAvatarList = deleteAvatarListFactory(ctx, this);
        this.deleteChat = deleteChatFactory(ctx, this);
        this.deleteMessage = deleteMessageFactory(ctx, this);
        this.disableGroupLink = disableGroupLinkFactory(ctx, this);
        this.disperseGroup = disperseGroupFactory(ctx, this);
        this.editNoteGroup = editNoteGroupFactory(ctx, this);
        this.editReminder = editReminderFactory(ctx, this);
        this.enableGroupLink = enableGroupLinkFactory(ctx, this);
        this.fetchAccountInfo = fetchAccountInfoFactory(ctx, this);
        this.findUser = findUserFactory(ctx, this);
        this.forwardMessage = forwardMessageFactory(ctx, this);
        this.getAliasList = getAliasListFactory(ctx, this);
        this.getAllFriends = getAllFriendsFactory(ctx, this);
        this.getAllGroups = getAllGroupsFactory(ctx, this);
        this.getArchivedChatList = getArchivedChatListFactory(ctx, this);
        this.getAutoDeleteChat = getAutoDeleteChatFactory(ctx, this);
        this.getAvatarList = getAvatarListFactory(ctx, this);
        this.getBizAccount = getBizAccountFactory(ctx, this);
        this.getContext = getContextFactory(ctx, this);
        this.getCookie = getCookieFactory(ctx, this);
        this.getFriendBoardList = getFriendBoardListFactory(ctx, this);
        this.getFriendRequest = getFriendRequestFactory(ctx, this);
        this.getRecommendRequest = getRecommendRequestFactory(ctx, this);
        this.getGroupInfo = getGroupInfoFactory(ctx, this);
        this.getGroupMembersInfo = getGroupMembersInfoFactory(ctx, this);
        this.getHiddenConversPin = getHiddenConversPinFactory(ctx, this);
        this.getLabels = getLabelsFactory(ctx, this);
        this.getListPoll = getListPollFactory(ctx, this);
        this.getListReminder = getListReminderFactory(ctx, this);
        this.getMute = getMuteFactory(ctx, this);
        this.getOwnId = getOwnIdFactory(ctx, this);
        this.getPinConversations = getPinConversationsFactory(ctx, this);
        this.getPollDetail = getPollDetailFactory(ctx, this);
        this.getQR = getQRFactory(ctx, this);
        this.getQuickMessage = getQuickMessageFactory(ctx, this);
        this.getRecvFriendRequest = getRecvFriendRequestFactory(ctx, this);
        this.getReminder = getReminderFactory(ctx, this);
        this.getReminderEvent = getReminderEventFactory(ctx, this);
        this.getStickers = getStickersFactory(ctx, this);
        this.getStickersDetail = getStickersDetailFactory(ctx, this);
        this.getUnreadMark = getUnreadMarkFactory(ctx, this);
        this.getUserInfo = getUserInfoFactory(ctx, this);
        this.inviteUserToGroups = inviteUserToGroupsFactory(ctx, this);
        this.joinGroup = joinGroupFactory(ctx, this);
        this.keepAlive = keepAliveFactory(ctx, this);
        this.lastOnline = lastOnlineFactory(ctx, this);
        this.leaveGroup = leaveGroupFactory(ctx, this);
        this.linkGroupInfo = linkGroupInfoFactory(ctx, this);
        this.lockPoll = lockPollFactory(ctx, this);
        this.parseLink = parseLinkFactory(ctx, this);
        this.pinConversations = pinConversationsFactory(ctx, this);
        this.removeFriend = removeFriendFactory(ctx, this);
        this.removeFriendAlias = removeFriendAliasFactory(ctx, this);
        this.removeGroupDeputy = removeGroupDeputyFactory(ctx, this);
        this.removeHiddenConversPin = removeHiddenConversPinFactory(ctx, this);
        this.removeQuickMessage = removeQuickMessageFactory(ctx, this);
        this.removeReminder = removeReminderFactory(ctx, this);
        this.removeUnreadMark = removeUnreadMarkFactory(ctx, this);
        this.removeUserFromGroup = removeUserFromGroupFactory(ctx, this);
        this.resetHiddenConversPin = resetHiddenConversPinFactory(ctx, this);
        this.reuseAvatar = reuseAvatarFactory(ctx, this);
        this.sendCard = sendCardFactory(ctx, this);
        this.sendDeliveredEvent = sendDeliveredEventFactory(ctx, this);
        this.sendFriendRequest = sendFriendRequestFactory(ctx, this);
        this.sendLink = sendLinkFactory(ctx, this);
        this.sendMessage = sendMessageFactory(ctx, this);
        this.sendReport = sendReportFactory(ctx, this);
        this.sendSeenEvent = sendSeenEventFactory(ctx, this);
        this.sendSticker = sendStickerFactory(ctx, this);
        this.sendTypingEvent = sendTypingEventFactory(ctx, this);
        this.sendVideo = sendVideoFactory(ctx, this);
        this.sendVoice = sendVoiceFactory(ctx, this);
        this.setMute = setMuteFactory(ctx, this);
        this.unblockUser = unblockUserFactory(ctx, this);
        this.undo = undoFactory(ctx, this);
        this.undoFriendRequest = undoFriendRequestFactory(ctx, this);
        this.updateAutoDeleteChat = updateAutoDeleteChatFactory(ctx, this);
        this.updateGroupSettings = updateGroupSettingsFactory(ctx, this);
        this.updateHiddenConversPin = updateHiddenConversPinFactory(ctx, this);
        this.updateLabels = updateLabelsFactory(ctx, this);
        this.updateLang = updateLangFactory(ctx, this);
        this.updateProfile = updateProfileFactory(ctx, this);
        this.updateQuickMessage = updateQuickMessageFactory(ctx, this);
        this.updateSettings = updateSettingsFactory(ctx, this);
        this.uploadAttachment = uploadAttachmentFactory(ctx, this);
        this.custom = customFactory(ctx, this);
    }
}
