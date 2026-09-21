export type GroupSetting = {
    blockName: number;
    signAdminMsg: number;
    addMemberOnly: number;
    setTopicOnly: number;
    enableMsgHistory: number;
    joinAppr: number;
    lockCreatePost: number;
    lockCreatePoll: number;
    lockSendMsg: number;
    lockViewMember: number;
    bannFeature: number;
    dirtyMedia: number;
    banDuration: number;
};
export declare enum GroupTopicType {
    Note = 0,
    Message = 2,
    Poll = 3
}
export type GroupTopicNoteParams = {
    client_msg_id: string;
    global_msg_id: string;
    title: string;
};
export type GroupTopicTextMessageParams = {
    senderUid: string;
    senderName: string;
    client_msg_id: string;
    global_msg_id: string;
    msg_type: 1;
    title: string;
};
export type GroupTopicVoiceMessageParams = GroupTopicImageMessageParams & {
    msg_type: 31;
};
export type GroupTopicImageMessageParams = GroupTopicTextMessageParams & {
    msg_type: 32;
    thumb: string;
};
export type GroupTopicVideoMessageParams = GroupTopicTextMessageParams & {
    msg_type: 44;
    thumb: string;
};
export type GroupTopicFileMessageParams = GroupTopicTextMessageParams & {
    msg_type: 46;
    extra: {
        fileSize: string;
        checksum: string;
        checksumSha: unknown;
        fileExt: string;
        fdata: string;
        fType: number;
    };
};
export type GroupTopicGifMessageParams = GroupTopicTextMessageParams & {
    msg_type: 49;
    thumb: string;
};
export type GroupTopicMessageParams = GroupTopicTextMessageParams | GroupTopicVoiceMessageParams | GroupTopicImageMessageParams | GroupTopicVideoMessageParams | GroupTopicFileMessageParams | GroupTopicGifMessageParams;
export type GroupTopicPollParams = {
    pollId: number;
    title: string;
};
export type GroupTopicOtherParams = {
    [key: string]: unknown;
};
export type GroupTopic = {
    type: GroupTopicType;
    color: number;
    emoji: string;
    startTime: number;
    duration: number;
    params: GroupTopicNoteParams | GroupTopicMessageParams | GroupTopicPollParams | GroupTopicOtherParams;
    id: string;
    creatorId: string;
    createTime: number;
    editorId: string;
    editTime: number;
    repeat: number;
    action: number;
};
export declare enum GroupType {
    Group = 1,
    Community = 2
}
export type GroupCurrentMem = {
    id: string;
    dName: string;
    zaloName: string;
    avatar: string;
    avatar_25: string;
    accountStatus: number;
    type: number;
};
export type GroupInfo = {
    groupId: string;
    name: string;
    desc: string;
    type: GroupType;
    creatorId: string;
    version: string;
    avt: string;
    fullAvt: string;
    memberIds: string[];
    adminIds: string[];
    currentMems: GroupCurrentMem[];
    updateMems: unknown[];
    admins: unknown[];
    hasMoreMember: number;
    subType: number;
    totalMember: number;
    maxMember: number;
    setting: GroupSetting;
    createdTime: number;
    visibility: number;
    globalId: string;
    /**
     * 1: True, 0: False
     */
    e2ee: number;
    extraInfo: {
        enable_media_store: number;
    };
};
