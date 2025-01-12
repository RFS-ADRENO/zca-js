import { Listener } from "./apis/listen.js";
import { getServerInfo, login } from "./apis/login.js";
import { createContext, isContextSession, type ContextBase, type ContextSession, type Options } from "./context.js";
import { generateZaloUUID, logger, makeURL } from "./utils.js";

import toughCookie from "tough-cookie";
import { acceptFriendRequestFactory } from "./apis/acceptFriendRequest.js";
import { addGroupDeputyFactory } from "./apis/addGroupDeputy.js";
import { addReactionFactory } from "./apis/addReaction.js";
import { addUserToGroupFactory } from "./apis/addUserToGroup.js";
import { blockUserFactory } from "./apis/blockUser.js";
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
import { getOwnIdFactory } from "./apis/getOwnId.js";
import { getPollDetailFactory } from "./apis/getPollDetail.js";
import { getQRFactory } from "./apis/getQR.js";
import { getStickersFactory } from "./apis/getStickers.js";
import { getStickersDetailFactory } from "./apis/getStickersDetail.js";
import { getUserInfoFactory } from "./apis/getUserInfo.js";
import { lockPollFactory } from "./apis/lockPoll.js";
import { loginQR } from "./apis/loginQR.js";
import { pinConversationsFactory } from "./apis/pinConversations.js";
import { removeGroupDeputyFactory } from "./apis/removeGroupDeputy.js";
import { removeUserFromGroupFactory } from "./apis/removeUserFromGroup.js";
import { sendCardFactory } from "./apis/sendCard.js";
import { sendFriendRequestFactory } from "./apis/sendFriendRequest.js";
import { sendMessageFactory } from "./apis/sendMessage.js";
import { sendReportFactory } from "./apis/sendReport.js";
import { sendStickerFactory } from "./apis/sendSticker.js";
import { sendVideoFactory } from "./apis/sendVideo.js";
import { sendVoiceFactory } from "./apis/sendVoice.js";
import { unblockUserFactory } from "./apis/unblockUser.js";
import { undoFactory } from "./apis/undo.js";
import { uploadAttachmentFactory } from "./apis/uploadAttachment.js";
import { ZaloApiError } from "./Errors/ZaloApiError.js";
import { checkUpdate } from "./update.js";

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

        if (!isContextSession(ctx)) throw new Error("Khởi tạo ngữ cảnh thát bại.");

        logger(ctx).info("Logged in as", loginData.data.uid);

        return new API(
            ctx,
            loginData.data.zpw_service_map_v3,
            makeURL(ctx, loginData.data.zpw_ws[0], {
                t: Date.now(),
            }),
        );
    }

    public async loginQR(
        options?: { userAgent?: string; language?: string; qrPath?: string },
        callback?: (qrPath: string) => any,
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
        if (!loginQRResult) throw new ZaloApiError("Đăng nhập với QR thất bại");
        return this.loginCookie(ctx, {
            cookie: loginQRResult.cookies,
            imei: generateZaloUUID(options.userAgent),
            userAgent: options.userAgent,
            language: options.language,
        });
    }
}

export class API {
    public zpwServiceMap: Record<string, string[]>;
    public listener: Listener;

    public acceptFriendRequest: ReturnType<typeof acceptFriendRequestFactory>;
    public addGroupDeputy: ReturnType<typeof addGroupDeputyFactory>;
    public addReaction: ReturnType<typeof addReactionFactory>;
    public addUserToGroup: ReturnType<typeof addUserToGroupFactory>;
    public blockUser: ReturnType<typeof blockUserFactory>;
    public changeGroupAvatar: ReturnType<typeof changeGroupAvatarFactory>;
    public changeGroupName: ReturnType<typeof changeGroupNameFactory>;
    public changeGroupOwner: ReturnType<typeof changeGroupOwnerFactory>;
    public changeFriendAlias: ReturnType<typeof changeFriendAliasFactory>;
    public createGroup: ReturnType<typeof createGroupFactory>;
    public createNote: ReturnType<typeof createNoteFactory>;
    public createPoll: ReturnType<typeof createPollFactory>;
    public deleteMessage: ReturnType<typeof deleteMessageFactory>;
    public disperseGroup: ReturnType<typeof disperseGroupFactory>;
    public editNote: ReturnType<typeof editNoteFactory>;
    public fetchAccountInfo: ReturnType<typeof fetchAccountInfoFactory>;
    public findUser: ReturnType<typeof findUserFactory>;
    public getAllFriends: ReturnType<typeof getAllFriendsFactory>;
    public getAllGroups: ReturnType<typeof getAllGroupsFactory>;
    public getCookie: ReturnType<typeof getCookieFactory>;
    public getGroupInfo: ReturnType<typeof getGroupInfoFactory>;
    public getOwnId: ReturnType<typeof getOwnIdFactory>;
    public getPollDetail: ReturnType<typeof getPollDetailFactory>;
    public getContext: ReturnType<typeof getContextFactory>;
    public getQR: ReturnType<typeof getQRFactory>;
    public getStickers: ReturnType<typeof getStickersFactory>;
    public getStickersDetail: ReturnType<typeof getStickersDetailFactory>;
    public getUserInfo: ReturnType<typeof getUserInfoFactory>;
    public lockPoll: ReturnType<typeof lockPollFactory>;
    public pinConversations: ReturnType<typeof pinConversationsFactory>;
    public removeGroupDeputy: ReturnType<typeof removeGroupDeputyFactory>;
    public removeUserFromGroup: ReturnType<typeof removeUserFromGroupFactory>;
    public sendCard: ReturnType<typeof sendCardFactory>;
    public sendFriendRequest: ReturnType<typeof sendFriendRequestFactory>;
    public sendMessage: ReturnType<typeof sendMessageFactory>;
    public sendReport: ReturnType<typeof sendReportFactory>;
    public sendSticker: ReturnType<typeof sendStickerFactory>;
    public sendVideo: ReturnType<typeof sendVideoFactory>;
    public sendVoice: ReturnType<typeof sendVoiceFactory>;
    public unblockUser: ReturnType<typeof unblockUserFactory>;
    public undo: ReturnType<typeof undoFactory>;
    public uploadAttachment: ReturnType<typeof uploadAttachmentFactory>;

    constructor(ctx: ContextSession, zpwServiceMap: Record<string, string[]>, wsUrl: string) {
        this.zpwServiceMap = zpwServiceMap;
        this.listener = new Listener(ctx, wsUrl);

        this.acceptFriendRequest = acceptFriendRequestFactory(ctx, this);
        this.addGroupDeputy = addGroupDeputyFactory(ctx, this);
        this.addReaction = addReactionFactory(ctx, this);
        this.addUserToGroup = addUserToGroupFactory(ctx, this);
        this.blockUser = blockUserFactory(ctx, this);
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
        this.getOwnId = getOwnIdFactory(ctx, this);
        this.getPollDetail = getPollDetailFactory(ctx, this);
        this.getContext = getContextFactory(ctx, this);
        this.getQR = getQRFactory(ctx, this);
        this.getStickers = getStickersFactory(ctx, this);
        this.getStickersDetail = getStickersDetailFactory(ctx, this);
        this.getUserInfo = getUserInfoFactory(ctx, this);
        this.lockPoll = lockPollFactory(ctx, this);
        this.pinConversations = pinConversationsFactory(ctx, this);
        this.removeGroupDeputy = removeGroupDeputyFactory(ctx, this);
        this.removeUserFromGroup = removeUserFromGroupFactory(ctx, this);
        this.sendCard = sendCardFactory(ctx, this);
        this.sendFriendRequest = sendFriendRequestFactory(ctx, this);
        this.sendMessage = sendMessageFactory(ctx, this);
        this.sendReport = sendReportFactory(ctx, this);
        this.sendSticker = sendStickerFactory(ctx, this);
        this.sendVideo = sendVideoFactory(ctx, this);
        this.sendVoice = sendVoiceFactory(ctx, this);
        this.unblockUser = unblockUserFactory(ctx, this);
        this.undo = undoFactory(ctx, this);
        this.uploadAttachment = uploadAttachmentFactory(ctx, this);
    }
}
