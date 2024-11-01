import { Listener } from "./apis/listen.js";
import { getServerInfo, login } from "./apis/login.js";
import { appContext, type Options } from "./context.js";
import { logger, makeURL } from "./utils.js";

import { acceptFriendRequestFactory } from "./apis/acceptFriendRequest.js";
import { addReactionFactory } from "./apis/addReaction.js";
import { addUserToGroupFactory } from "./apis/addUserToGroup.js";
import { blockUserFactory } from "./apis/blockUser.js";
import { changeGroupAvatarFactory } from "./apis/changeGroupAvatar.js";
import { changeGroupNameFactory } from "./apis/changeGroupName.js";
import { createGroupFactory } from "./apis/createGroup.js";
import { deleteMessageFactory } from "./apis/deleteMessage.js";
import { fetchAccountInfoFactory } from "./apis/fetchAccountInfo.js";
import { findUserFactory } from "./apis/findUser.js";
import { getAllFriendsFactory } from "./apis/getAllFriends.js";
import { getAllGroupsFactory } from "./apis/getAllGroups.js";
import { getContextFactory } from "./apis/getContext.js";
import { getCookieFactory } from "./apis/getCookie.js";
import { getGroupInfoFactory } from "./apis/getGroupInfo.js";
import { getOwnIdFactory } from "./apis/getOwnId.js";
import { getStickersFactory } from "./apis/getStickers.js";
import { getStickersDetailFactory } from "./apis/getStickersDetail.js";
import { getUserInfoFactory } from "./apis/getUserInfo.js";
import { removeUserFromGroupFactory } from "./apis/removeUserFromGroup.js";
import { sendFriendRequestFactory } from "./apis/sendFriendRequest.js";
import { sendMessageFactory } from "./apis/sendMessage.js";
import { sendStickerFactory } from "./apis/sendSticker.js";
import { unblockUserFactory } from "./apis/unblockUser.js";
import { undoFactory } from "./apis/undo.js";
import { uploadAttachmentFactory } from "./apis/uploadAttachment.js";
import { checkUpdate } from "./update.js";

export type J2Cookies = {
    url: string;
    cookies: {
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
    }[];
};

export type Credentials = {
    imei: string;
    cookie: string | J2Cookies;
    userAgent: string;
    language?: string;
};

export class Zalo {
    private enableEncryptParam = true;

    constructor(credentials: Credentials, options?: Partial<Options>) {
        this.validateParams(credentials);

        appContext.imei = credentials.imei;
        appContext.cookie = this.parseCookies(credentials.cookie);
        appContext.userAgent = credentials.userAgent;
        appContext.language = credentials.language || "vi";

        appContext.secretKey = null;

        if (options) Object.assign(appContext.options, options);
    }

    private parseCookies(cookie: string | J2Cookies) {
        if (typeof cookie === "string") return cookie;

        const cookieString = cookie.cookies.map((c) => `${c.name}=${c.value}`).join("; ");
        return cookieString;
    }

    private validateParams(credentials: Credentials) {
        if (!credentials.imei || !credentials.cookie || !credentials.userAgent) {
            throw new Error("Missing required params");
        }
    }

    public async login() {
        await checkUpdate();

        const loginData = await login(this.enableEncryptParam);
        const serverInfo = await getServerInfo(this.enableEncryptParam);

        if (!loginData || !serverInfo) throw new Error("Failed to login");
        appContext.secretKey = loginData.data.zpw_enk;
        appContext.uid = loginData.data.uid;

        // Zalo currently responds with setttings instead of settings
        // they might fix this in the future, so we should have a fallback just in case
        appContext.settings = serverInfo.setttings || serverInfo.settings;

        appContext.extraVer = serverInfo.extra_ver;

        logger.info("Logged in as", loginData.data.uid);

        return new API(
            loginData.data.zpw_service_map_v3,
            makeURL(loginData.data.zpw_ws[0], {
                t: Date.now(),
            }),
        );
    }
}

export class API {
    public zpwServiceMap: Record<string, string[]>;
    public listener: Listener;

    public acceptFriendRequest: ReturnType<typeof acceptFriendRequestFactory>;
    public addReaction: ReturnType<typeof addReactionFactory>;
    public addUserToGroup: ReturnType<typeof addUserToGroupFactory>;
    public blockUser: ReturnType<typeof blockUserFactory>;
    public changeGroupAvatar: ReturnType<typeof changeGroupAvatarFactory>;
    public changeGroupName: ReturnType<typeof changeGroupNameFactory>;
    public createGroup: ReturnType<typeof createGroupFactory>;
    public deleteMessage: ReturnType<typeof deleteMessageFactory>;
    public fetchAccountInfo: ReturnType<typeof fetchAccountInfoFactory>;
    public findUser: ReturnType<typeof findUserFactory>;
    public getAllFriends: ReturnType<typeof getAllFriendsFactory>;
    public getAllGroups: ReturnType<typeof getAllGroupsFactory>;
    public getCookie: ReturnType<typeof getCookieFactory>;
    public getGroupInfo: ReturnType<typeof getGroupInfoFactory>;
    public getOwnId: ReturnType<typeof getOwnIdFactory>;
    public getContext: ReturnType<typeof getContextFactory>;
    public getStickers: ReturnType<typeof getStickersFactory>;
    public getStickersDetail: ReturnType<typeof getStickersDetailFactory>;
    public getUserInfo: ReturnType<typeof getUserInfoFactory>;
    public removeUserFromGroup: ReturnType<typeof removeUserFromGroupFactory>;
    public sendFriendRequest: ReturnType<typeof sendFriendRequestFactory>;
    public sendMessage: ReturnType<typeof sendMessageFactory>;
    public sendSticker: ReturnType<typeof sendStickerFactory>;
    public unblockUser: ReturnType<typeof unblockUserFactory>;
    public undo: ReturnType<typeof undoFactory>;
    public uploadAttachment: ReturnType<typeof uploadAttachmentFactory>;

    constructor(zpwServiceMap: Record<string, string[]>, wsUrl: string) {
        this.zpwServiceMap = zpwServiceMap;
        this.listener = new Listener(wsUrl);

        this.acceptFriendRequest = acceptFriendRequestFactory(this);
        this.addReaction = addReactionFactory(this);
        this.addUserToGroup = addUserToGroupFactory(this);
        this.blockUser = blockUserFactory(this);
        this.changeGroupAvatar = changeGroupAvatarFactory(this);
        this.changeGroupName = changeGroupNameFactory(this);
        this.createGroup = createGroupFactory(this);
        this.deleteMessage = deleteMessageFactory(this);
        this.fetchAccountInfo = fetchAccountInfoFactory(this);
        this.findUser = findUserFactory(this);
        this.getAllFriends = getAllFriendsFactory(this);
        this.getAllGroups = getAllGroupsFactory(this);
        this.getCookie = getCookieFactory(this);
        this.getGroupInfo = getGroupInfoFactory(this);
        this.getOwnId = getOwnIdFactory(this);
        this.getContext = getContextFactory(this);

        this.addReaction = addReactionFactory(this);
        this.getStickers = getStickersFactory(this);
        this.getStickersDetail = getStickersDetailFactory(this);
        this.getUserInfo = getUserInfoFactory(this);
        this.removeUserFromGroup = removeUserFromGroupFactory(this);
        this.sendFriendRequest = sendFriendRequestFactory(this);
        this.sendMessage = sendMessageFactory(this);
        this.sendSticker = sendStickerFactory(this);
        this.unblockUser = unblockUserFactory(this);
        this.undo = undoFactory(this);
        this.uploadAttachment = uploadAttachmentFactory(this);
    }
}
