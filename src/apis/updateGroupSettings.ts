import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type UpdateGroupSettingsOptions = {
    blockName?: boolean; // thay doi ten va anh dai dien nhom
    signAdminMsg?: boolean; // danh dau tin nhan tu truong/pho nhom
    addMemberOnly?: boolean; // chi admin moi them duoc thanh vien
    setTopicOnly?: boolean; // ghim tin nhan, ghi chu, binh chon len dau hoi thoai
    enableMsgHistory?: boolean; // cho phep thanh vien moi doc lai tin nhan gan nhat
    joinAppr?: boolean; // che do phe duyet thanh vien moi
    lockCreatePost?: boolean; // tao moi ghi chu, nhac hen
    lockCreatePoll?: boolean; // tao moi binh chon
    lockSendMsg?: boolean; // gui tin nhan

    lockViewMember?: boolean; // tat het bat chi truong/pho nhom nhan 
    bannFeature?: boolean; // tat ghim tin nhan, ghi chu, binh chon len dau hoi thoai va cho phep thanh vien doc lai tin nhan gan nhat
    // dirtyMedia?: boolean; // khong cho thanh vien gui anh, video
    // banDuration?: boolean | number; // thoi gian ban thanh vien
};

export type UpdateGroupSettingsResponse = {};

export const updateGroupSettingsFactory = apiFactory<UpdateGroupSettingsResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.group[0]}/api/group/setting/update`);

    /**
     * Update group settings
     *
     * @param options Options
     * @param groupId Group ID
     *
     * @throws ZaloApiError
     */
    return async function updateGroupSettings(options: UpdateGroupSettingsOptions, groupId: string) {
        const params = {
            blockName: options.blockName ? 0 : 1,
            signAdminMsg: options.signAdminMsg ? 1 : 0,
            addMemberOnly: options.addMemberOnly ? 0 : 1,
            setTopicOnly: options.setTopicOnly ? 0 : 1,
            enableMsgHistory: options.enableMsgHistory ? 1 : 0,
            joinAppr: options.joinAppr ? 1 : 0,
            lockCreatePost: options.lockCreatePost ? 0 : 1,
            lockCreatePoll: options.lockCreatePoll ? 0 : 1,
            lockSendMsg: options.lockSendMsg ? 0 : 1,

            lockViewMember: options.lockViewMember ? 1: 0,
            bannFeature: options.bannFeature ? 1 : 0,
            // dirtyMedia: options.dirtyMedia ? 1 : 0, // not see
            // banDuration: options.banDuration ? 1 : 0, // not see
            // blocked_members: [], not implemented
            grid: groupId,
            imei: ctx.imei,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
