import { Listener } from "./apis/listen.js";
import { getServerInfo, login } from "./apis/login.js";
import {
    createContext,
    isContextSession,
    type ContextBase,
    type ContextSession,
    type Options,
    type ZPWServiceMap,
} from "./context.js";
import { generateZaloUUID, logger } from "./utils.js";

import toughCookie from "tough-cookie";
import { acceptFriendRequestFactory } from "./apis/acceptFriendRequest.js";
import { addGroupDeputyFactory } from "./apis/addGroupDeputy.js";
import { addQuickMessageFactory } from "./apis/addQuickMessage.js";
import { addReactionFactory } from "./apis/addReaction.js";
import { addUnreadMarkFactory } from "./apis/addUnreadMark.js";
import { addUserToGroupFactory } from "./apis/addUserToGroup.js";
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
import { deleteAvatarFactory } from "./apis/deleteAvatar.js";
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
import { getGroupInfoFactory } from "./apis/getGroupInfo.js";
import { getGroupLinkInfoFactory } from "./apis/getGroupLinkInfo.js";
import { getGroupMembersInfoFactory } from "./apis/getGroupMembersInfo.js";
import { getHiddenConversationsFactory } from "./apis/getHiddenConversations.js";
import { getLabelsFactory } from "./apis/getLabels.js";
import { getListBoardFactory } from "./apis/getListBoard.js";
import { getListReminderFactory } from "./apis/getListReminder.js";
import { getMuteFactory } from "./apis/getMute.js";
import { getOwnIdFactory } from "./apis/getOwnId.js";
import { getPinConversationsFactory } from "./apis/getPinConversations.js";
import { getPollDetailFactory } from "./apis/getPollDetail.js";
import { getQRFactory } from "./apis/getQR.js";
import { getQuickMessageFactory } from "./apis/getQuickMessage.js";
import { getReceivedFriendRequestsFactory } from "./apis/getReceivedFriendRequests.js";
import { getReminderFactory } from "./apis/getReminder.js";
import { getReminderResponsesFactory } from "./apis/getReminderResponses.js";
import { getSentFriendRequestFactory } from "./apis/getSentFriendRequest.js";
import { getStickersFactory } from "./apis/getStickers.js";
import { getStickersDetailFactory } from "./apis/getStickersDetail.js";
import { getUnreadMarkFactory } from "./apis/getUnreadMark.js";
import { getUserInfoFactory } from "./apis/getUserInfo.js";
import { inviteUserToGroupsFactory } from "./apis/inviteUserToGroups.js";
import { joinGroupFactory } from "./apis/joinGroup.js";
import { keepAliveFactory } from "./apis/keepAlive.js";
import { lastOnlineFactory } from "./apis/lastOnline.js";
import { leaveGroupFactory } from "./apis/leaveGroup.js";
import { lockPollFactory } from "./apis/lockPoll.js";
import { loginQR, LoginQRCallbackEventType, type LoginQRCallback } from "./apis/loginQR.js";
import { parseLinkFactory } from "./apis/parseLink.js";
import { removeFriendFactory } from "./apis/removeFriend.js";
import { removeFriendAliasFactory } from "./apis/removeFriendAlias.js";
import { removeGroupDeputyFactory } from "./apis/removeGroupDeputy.js";
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
import { setHiddenConversationsFactory } from "./apis/setHiddenConversations.js";
import { setMuteFactory } from "./apis/setMute.js";
import { setPinnedConversationsFactory } from "./apis/setPinnedConversations.js";
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

export type Cookie = {
    domain: string;
    expirationDate: number;
    hostOnly: boolean;
    httpOnly: boolean;
    name: string;
    path: string;
    sameSite: string;
    secure: boolean;
    session: boolean;
    storeId: string;
    value: string;
};

export type Credentials = {
    imei: string;
    cookie: Cookie[] | toughCookie.SerializedCookie[] | { url: string; cookies: Cookie[] };
    userAgent: string;
    language?: string;
};

export class Zalo {
    private enableEncryptParam = true;

    constructor(private options: Partial<Options> = {}) {}

    private parseCookies(cookie: Credentials["cookie"]): toughCookie.CookieJar {
        const cookieArr = Array.isArray(cookie) ? cookie : cookie.cookies;

        cookieArr.forEach((e, i) => {
            if (typeof e.domain == "string" && e.domain.startsWith(".")) cookieArr[i].domain = e.domain.slice(1);
        });

        const jar = new toughCookie.CookieJar();
        for (const each of cookieArr) {
            try {
                jar.setCookieSync(
                    toughCookie.Cookie.fromJSON({
                        ...each,
                        key: (each as toughCookie.SerializedCookie).key || each.name,
                    }) ?? "",
                    "https://chat.zalo.me",
                );
            } catch {}
        }
        return jar;
    }

    private validateParams(credentials: Credentials) {
        if (!credentials.imei || !credentials.cookie || !credentials.userAgent) {
            throw new Error("Missing required params");
        }
    }

    public async login(credentials: Credentials) {
        const ctx = createContext(this.options.apiType, this.options.apiVersion);
        Object.assign(ctx.options, this.options);

        return this.loginCookie(ctx, credentials);
    }

    private async loginCookie(ctx: ContextBase, credentials: Credentials) {
        await checkUpdate(ctx);

        this.validateParams(credentials);

        ctx.imei = credentials.imei;
        ctx.cookie = this.parseCookies(credentials.cookie);
        ctx.userAgent = credentials.userAgent;
        ctx.language = credentials.language || "vi";

        const loginData = await login(ctx, this.enableEncryptParam);
        const serverInfo = await getServerInfo(ctx, this.enableEncryptParam);

        if (!loginData || !serverInfo) throw new Error("Đăng nhập thất bại");
        ctx.secretKey = loginData.data.zpw_enk;
        ctx.uid = loginData.data.uid;

        // Zalo currently responds with setttings instead of settings
        // they might fix this in the future, so we should have a fallback just in case
        ctx.settings = serverInfo.setttings || serverInfo.settings;

        ctx.extraVer = serverInfo.extra_ver;

        if (!isContextSession(ctx)) throw new Error("Khởi tạo ngữ cảnh thất bại.");

        logger(ctx).info("Logged in as", loginData.data.uid);

        return new API(ctx, loginData.data.zpw_service_map_v3, loginData.data.zpw_ws);
    }

    public async loginQR(
        options?: { userAgent?: string; language?: string; qrPath?: string },
        callback?: LoginQRCallback,
    ) {
        if (!options) options = {};
        if (!options.userAgent)
            options.userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0";
        if (!options.language) options.language = "vi";

        const ctx = createContext(this.options.apiType, this.options.apiVersion);
        Object.assign(ctx.options, this.options);

        const loginQRResult = await loginQR(
            ctx,
            options as { userAgent: string; language: string; qrPath?: string },
            callback,
        );
        if (!loginQRResult) throw new ZaloApiError("Unable to login with QRCode");

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
    public zpwServiceMap: ZPWServiceMap;
    public listener: Listener;

    public acceptFriendRequest: ReturnType<typeof acceptFriendRequestFactory>;
    public addGroupDeputy: ReturnType<typeof addGroupDeputyFactory>;
    public addQuickMessage: ReturnType<typeof addQuickMessageFactory>;
    public addReaction: ReturnType<typeof addReactionFactory>;
    public addUnreadMark: ReturnType<typeof addUnreadMarkFactory>;
    public addUserToGroup: ReturnType<typeof addUserToGroupFactory>;
    public blockUser: ReturnType<typeof blockUserFactory>;
    public blockViewFeed: ReturnType<typeof blockViewFeedFactory>;
    public changeAccountAvatar: ReturnType<typeof changeAccountAvatarFactory>;
    public changeFriendAlias: ReturnType<typeof changeFriendAliasFactory>;
    public changeGroupAvatar: ReturnType<typeof changeGroupAvatarFactory>;
    public changeGroupName: ReturnType<typeof changeGroupNameFactory>;
    public changeGroupOwner: ReturnType<typeof changeGroupOwnerFactory>;
    public createGroup: ReturnType<typeof createGroupFactory>;
    public createNoteGroup: ReturnType<typeof createNoteGroupFactory>;
    public createPoll: ReturnType<typeof createPollFactory>;
    public createReminder: ReturnType<typeof createReminderFactory>;
    public deleteAvatarList: ReturnType<typeof deleteAvatarFactory>;
    public deleteChat: ReturnType<typeof deleteChatFactory>;
    public deleteMessage: ReturnType<typeof deleteMessageFactory>;
    public disableGroupLink: ReturnType<typeof disableGroupLinkFactory>;
    public disperseGroup: ReturnType<typeof disperseGroupFactory>;
    public editNoteGroup: ReturnType<typeof editNoteGroupFactory>;
    public editReminder: ReturnType<typeof editReminderFactory>;
    public enableGroupLink: ReturnType<typeof enableGroupLinkFactory>;
    public fetchAccountInfo: ReturnType<typeof fetchAccountInfoFactory>;
    public findUser: ReturnType<typeof findUserFactory>;
    public forwardMessage: ReturnType<typeof forwardMessageFactory>;
    public getAliasList: ReturnType<typeof getAliasListFactory>;
    public getAllFriends: ReturnType<typeof getAllFriendsFactory>;
    public getAllGroups: ReturnType<typeof getAllGroupsFactory>;
    public getArchivedChatList: ReturnType<typeof getArchivedChatListFactory>;
    public getAutoDeleteChat: ReturnType<typeof getAutoDeleteChatFactory>;
    public getAvatarList: ReturnType<typeof getAvatarListFactory>;
    public getBizAccount: ReturnType<typeof getBizAccountFactory>;
    public getContext: ReturnType<typeof getContextFactory>;
    public getCookie: ReturnType<typeof getCookieFactory>;
    public getFriendBoardList: ReturnType<typeof getFriendBoardListFactory>;
    public getGroupInfo: ReturnType<typeof getGroupInfoFactory>;
    public getGroupLinkInfo: ReturnType<typeof getGroupLinkInfoFactory>;
    public getGroupMembersInfo: ReturnType<typeof getGroupMembersInfoFactory>;
    public getHiddenConversations: ReturnType<typeof getHiddenConversationsFactory>;
    public getLabels: ReturnType<typeof getLabelsFactory>;
    public getListBoard: ReturnType<typeof getListBoardFactory>;
    public getListReminder: ReturnType<typeof getListReminderFactory>;
    public getMute: ReturnType<typeof getMuteFactory>;
    public getOwnId: ReturnType<typeof getOwnIdFactory>;
    public getPinConversations: ReturnType<typeof getPinConversationsFactory>;
    public getPollDetail: ReturnType<typeof getPollDetailFactory>;
    public getQR: ReturnType<typeof getQRFactory>;
    public getQuickMessage: ReturnType<typeof getQuickMessageFactory>;
    public getReceivedFriendRequests: ReturnType<typeof getReceivedFriendRequestsFactory>;
    public getReminder: ReturnType<typeof getReminderFactory>;
    public getReminderResponses: ReturnType<typeof getReminderResponsesFactory>;
    public getSentFriendRequest: ReturnType<typeof getSentFriendRequestFactory>;
    public getStickers: ReturnType<typeof getStickersFactory>;
    public getStickersDetail: ReturnType<typeof getStickersDetailFactory>;
    public getUnreadMark: ReturnType<typeof getUnreadMarkFactory>;
    public getUserInfo: ReturnType<typeof getUserInfoFactory>;
    public inviteUserToGroups: ReturnType<typeof inviteUserToGroupsFactory>;
    public joinGroup: ReturnType<typeof joinGroupFactory>;
    public keepAlive: ReturnType<typeof keepAliveFactory>;
    public lastOnline: ReturnType<typeof lastOnlineFactory>;
    public leaveGroup: ReturnType<typeof leaveGroupFactory>;
    public lockPoll: ReturnType<typeof lockPollFactory>;
    public parseLink: ReturnType<typeof parseLinkFactory>;
    public removeFriend: ReturnType<typeof removeFriendFactory>;
    public removeFriendAlias: ReturnType<typeof removeFriendAliasFactory>;
    public removeGroupDeputy: ReturnType<typeof removeGroupDeputyFactory>;
    public removeQuickMessage: ReturnType<typeof removeQuickMessageFactory>;
    public removeReminder: ReturnType<typeof removeReminderFactory>;
    public removeUnreadMark: ReturnType<typeof removeUnreadMarkFactory>;
    public removeUserFromGroup: ReturnType<typeof removeUserFromGroupFactory>;
    public resetHiddenConversPin: ReturnType<typeof resetHiddenConversPinFactory>;
    public reuseAvatar: ReturnType<typeof reuseAvatarFactory>;
    public sendCard: ReturnType<typeof sendCardFactory>;
    public sendDeliveredEvent: ReturnType<typeof sendDeliveredEventFactory>;
    public sendFriendRequest: ReturnType<typeof sendFriendRequestFactory>;
    public sendLink: ReturnType<typeof sendLinkFactory>;
    public sendMessage: ReturnType<typeof sendMessageFactory>;
    public sendReport: ReturnType<typeof sendReportFactory>;
    public sendSeenEvent: ReturnType<typeof sendSeenEventFactory>;
    public sendSticker: ReturnType<typeof sendStickerFactory>;
    public sendTypingEvent: ReturnType<typeof sendTypingEventFactory>;
    public sendVideo: ReturnType<typeof sendVideoFactory>;
    public sendVoice: ReturnType<typeof sendVoiceFactory>;
    public setHiddenConversations: ReturnType<typeof setHiddenConversationsFactory>;
    public setMute: ReturnType<typeof setMuteFactory>;
    public setPinnedConversations: ReturnType<typeof setPinnedConversationsFactory>;
    public unblockUser: ReturnType<typeof unblockUserFactory>;
    public undo: ReturnType<typeof undoFactory>;
    public undoFriendRequest: ReturnType<typeof undoFriendRequestFactory>;
    public updateAutoDeleteChat: ReturnType<typeof updateAutoDeleteChatFactory>;
    public updateGroupSettings: ReturnType<typeof updateGroupSettingsFactory>;
    public updateHiddenConversPin: ReturnType<typeof updateHiddenConversPinFactory>;
    public updateLabels: ReturnType<typeof updateLabelsFactory>;
    public updateLang: ReturnType<typeof updateLangFactory>;
    public updateProfile: ReturnType<typeof updateProfileFactory>;
    public updateQuickMessage: ReturnType<typeof updateQuickMessageFactory>;
    public updateSettings: ReturnType<typeof updateSettingsFactory>;
    public uploadAttachment: ReturnType<typeof uploadAttachmentFactory>;

    public custom: ReturnType<typeof customFactory>;

    constructor(ctx: ContextSession, zpwServiceMap: ZPWServiceMap, wsUrls: string[]) {
        this.zpwServiceMap = zpwServiceMap;
        this.listener = new Listener(ctx, wsUrls);

        this.acceptFriendRequest = acceptFriendRequestFactory(ctx, this);
        this.addGroupDeputy = addGroupDeputyFactory(ctx, this);
        this.addQuickMessage = addQuickMessageFactory(ctx, this);
        this.addReaction = addReactionFactory(ctx, this);
        this.addUnreadMark = addUnreadMarkFactory(ctx, this);
        this.addUserToGroup = addUserToGroupFactory(ctx, this);
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
        this.deleteAvatarList = deleteAvatarFactory(ctx, this);
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
        this.getGroupInfo = getGroupInfoFactory(ctx, this);
        this.getGroupLinkInfo = getGroupLinkInfoFactory(ctx, this);
        this.getGroupMembersInfo = getGroupMembersInfoFactory(ctx, this);
        this.getHiddenConversations = getHiddenConversationsFactory(ctx, this);
        this.getLabels = getLabelsFactory(ctx, this);
        this.getListBoard = getListBoardFactory(ctx, this);
        this.getListReminder = getListReminderFactory(ctx, this);
        this.getMute = getMuteFactory(ctx, this);
        this.getOwnId = getOwnIdFactory(ctx, this);
        this.getPinConversations = getPinConversationsFactory(ctx, this);
        this.getPollDetail = getPollDetailFactory(ctx, this);
        this.getQR = getQRFactory(ctx, this);
        this.getQuickMessage = getQuickMessageFactory(ctx, this);
        this.getReceivedFriendRequests = getReceivedFriendRequestsFactory(ctx, this);
        this.getReminder = getReminderFactory(ctx, this);
        this.getReminderResponses = getReminderResponsesFactory(ctx, this);
        this.getSentFriendRequest = getSentFriendRequestFactory(ctx, this);
        this.getStickers = getStickersFactory(ctx, this);
        this.getStickersDetail = getStickersDetailFactory(ctx, this);
        this.getUnreadMark = getUnreadMarkFactory(ctx, this);
        this.getUserInfo = getUserInfoFactory(ctx, this);
        this.inviteUserToGroups = inviteUserToGroupsFactory(ctx, this);
        this.joinGroup = joinGroupFactory(ctx, this);
        this.keepAlive = keepAliveFactory(ctx, this);
        this.lastOnline = lastOnlineFactory(ctx, this);
        this.leaveGroup = leaveGroupFactory(ctx, this);
        this.lockPoll = lockPollFactory(ctx, this);
        this.parseLink = parseLinkFactory(ctx, this);
        this.removeFriend = removeFriendFactory(ctx, this);
        this.removeFriendAlias = removeFriendAliasFactory(ctx, this);
        this.removeGroupDeputy = removeGroupDeputyFactory(ctx, this);
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
        this.setHiddenConversations = setHiddenConversationsFactory(ctx, this);
        this.setMute = setMuteFactory(ctx, this);
        this.setPinnedConversations = setPinnedConversationsFactory(ctx, this);
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
