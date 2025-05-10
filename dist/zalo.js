import { Listener } from "./apis/listen.js";
import { getServerInfo, login } from "./apis/login.js";
import { createContext, isContextSession, } from "./context.js";
import { generateZaloUUID, logger } from "./utils.js";
import toughCookie from "tough-cookie";
import { acceptFriendRequestFactory } from "./apis/acceptFriendRequest.js";
import { addGroupDeputyFactory } from "./apis/addGroupDeputy.js";
import { addReactionFactory } from "./apis/addReaction.js";
import { addUserToGroupFactory } from "./apis/addUserToGroup.js";
import { blockUserFactory } from "./apis/blockUser.js";
import { blockViewFeedFactory } from "./apis/blockViewFeed.js";
import { changeAccountAvatarFactory } from "./apis/changeAccountAvatar.js";
import { changeAccountSettingFactory } from "./apis/changeAccountSetting.js";
import { changeFriendAliasFactory } from "./apis/changeFriendAlias.js";
import { changeGroupAvatarFactory } from "./apis/changeGroupAvatar.js";
import { changeGroupNameFactory } from "./apis/changeGroupName.js";
import { changeGroupOwnerFactory } from "./apis/changeGroupOwner.js";
import { createGroupFactory } from "./apis/createGroup.js";
import { createNoteFactory } from "./apis/createNote.js";
import { createPollFactory } from "./apis/createPoll.js";
import { deleteMessageFactory } from "./apis/deleteMessage.js";
import { disperseGroupFactory } from "./apis/disperseGroup.js";
import { editNoteFactory } from "./apis/editNote.js";
import { fetchAccountInfoFactory } from "./apis/fetchAccountInfo.js";
import { findUserFactory } from "./apis/findUser.js";
import { getAllFriendsFactory } from "./apis/getAllFriends.js";
import { getAllGroupsFactory } from "./apis/getAllGroups.js";
import { getContextFactory } from "./apis/getContext.js";
import { getCookieFactory } from "./apis/getCookie.js";
import { getGroupInfoFactory } from "./apis/getGroupInfo.js";
import { getGroupMembersInfoFactory } from "./apis/getGroupMembersInfo.js";
import { getOwnIdFactory } from "./apis/getOwnId.js";
import { getPollDetailFactory } from "./apis/getPollDetail.js";
import { getQRFactory } from "./apis/getQR.js";
import { getStickersFactory } from "./apis/getStickers.js";
import { getStickersDetailFactory } from "./apis/getStickersDetail.js";
import { getUserInfoFactory } from "./apis/getUserInfo.js";
import { keepAliveFactory } from "./apis/keepAlive.js";
import { lockPollFactory } from "./apis/lockPoll.js";
import { loginQR, LoginQRCallbackEventType } from "./apis/loginQR.js";
import { pinConversationsFactory } from "./apis/pinConversations.js";
import { removeGroupDeputyFactory } from "./apis/removeGroupDeputy.js";
import { removeUserFromGroupFactory } from "./apis/removeUserFromGroup.js";
import { sendCardFactory } from "./apis/sendCard.js";
import { sendDeliveredEventFactory } from "./apis/sendDeliveredEvent.js";
import { sendFriendRequestFactory } from "./apis/sendFriendRequest.js";
import { sendMessageFactory } from "./apis/sendMessage.js";
import { sendReportFactory } from "./apis/sendReport.js";
import { sendSeenEventFactory } from "./apis/sendSeenEvent.js";
import { sendStickerFactory } from "./apis/sendSticker.js";
import { sendTypingEventFactory } from "./apis/sendTypingEvent.js";
import { sendVideoFactory } from "./apis/sendVideo.js";
import { sendVoiceFactory } from "./apis/sendVoice.js";
import { unblockUserFactory } from "./apis/unblockUser.js";
import { undoFactory } from "./apis/undo.js";
import { uploadAttachmentFactory } from "./apis/uploadAttachment.js";
import { ZaloApiError } from "./Errors/ZaloApiError.js";
import { checkUpdate } from "./update.js";
import { customFactory } from "./apis/custom.js";
import { getLabelsFactory } from "./apis/getLabels.js";
import { updateLabelsFactory } from "./apis/updateLabels.js";
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
        this.addReaction = addReactionFactory(ctx, this);
        this.addUserToGroup = addUserToGroupFactory(ctx, this);
        this.blockUser = blockUserFactory(ctx, this);
        this.blockViewFeed = blockViewFeedFactory(ctx, this);
        this.changeAccountAvatar = changeAccountAvatarFactory(ctx, this);
        this.changeAccountSetting = changeAccountSettingFactory(ctx, this);
        this.changeGroupAvatar = changeGroupAvatarFactory(ctx, this);
        this.changeGroupName = changeGroupNameFactory(ctx, this);
        this.changeGroupOwner = changeGroupOwnerFactory(ctx, this);
        this.changeFriendAlias = changeFriendAliasFactory(ctx, this);
        this.createGroup = createGroupFactory(ctx, this);
        this.createNote = createNoteFactory(ctx, this);
        this.createPoll = createPollFactory(ctx, this);
        this.deleteMessage = deleteMessageFactory(ctx, this);
        this.disperseGroup = disperseGroupFactory(ctx, this);
        this.editNote = editNoteFactory(ctx, this);
        this.fetchAccountInfo = fetchAccountInfoFactory(ctx, this);
        this.findUser = findUserFactory(ctx, this);
        this.getAllFriends = getAllFriendsFactory(ctx, this);
        this.getAllGroups = getAllGroupsFactory(ctx, this);
        this.getCookie = getCookieFactory(ctx, this);
        this.getGroupInfo = getGroupInfoFactory(ctx, this);
        this.getGroupMembersInfo = getGroupMembersInfoFactory(ctx, this);
        this.getLabels = getLabelsFactory(ctx, this);
        this.getOwnId = getOwnIdFactory(ctx, this);
        this.getPollDetail = getPollDetailFactory(ctx, this);
        this.getContext = getContextFactory(ctx, this);
        this.getQR = getQRFactory(ctx, this);
        this.getStickers = getStickersFactory(ctx, this);
        this.getStickersDetail = getStickersDetailFactory(ctx, this);
        this.getUserInfo = getUserInfoFactory(ctx, this);
        this.keepAlive = keepAliveFactory(ctx, this);
        this.lockPoll = lockPollFactory(ctx, this);
        this.pinConversations = pinConversationsFactory(ctx, this);
        this.removeGroupDeputy = removeGroupDeputyFactory(ctx, this);
        this.removeUserFromGroup = removeUserFromGroupFactory(ctx, this);
        this.sendCard = sendCardFactory(ctx, this);
        this.sendDeliveredEvent = sendDeliveredEventFactory(ctx, this);
        this.sendFriendRequest = sendFriendRequestFactory(ctx, this);
        this.sendMessage = sendMessageFactory(ctx, this);
        this.sendReport = sendReportFactory(ctx, this);
        this.sendSeenEvent = sendSeenEventFactory(ctx, this);
        this.sendSticker = sendStickerFactory(ctx, this);
        this.sendTypingEvent = sendTypingEventFactory(ctx, this);
        this.sendVideo = sendVideoFactory(ctx, this);
        this.sendVoice = sendVoiceFactory(ctx, this);
        this.unblockUser = unblockUserFactory(ctx, this);
        this.undo = undoFactory(ctx, this);
        this.updateLabels = updateLabelsFactory(ctx, this);
        this.uploadAttachment = uploadAttachmentFactory(ctx, this);
        this.custom = customFactory(ctx, this);
    }
}
