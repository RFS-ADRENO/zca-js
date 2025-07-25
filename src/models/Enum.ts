export enum ThreadType {
    User,
    Group,
}

export enum DestType {
    Group = 1,
    User = 3,
    Page = 5,
}

export enum ReminderRepeatMode {
    None = 0,
    Daily = 1,
    Weekly = 2,
    Monthly = 3,
}

export enum Gender {
    Male = 0,
    Female = 1,
}

export enum BoardType {
    Note = 1,
    PinnedMessage = 2,
    Poll = 3,
}

/**
 * @note Bank codes list after Mitm on Mobile and Bank's supported by Zalo
 * @documents https://developers.zalo.me/docs/zalo-notification-service/phu-luc/danh-sach-bin-code - docs missing bin code and short_name bank
 */
export enum BinBankCard {
    ABBank = 970425,
    ACB = 970416,
    Agribank = 970405,
    BIDV = 970418,
    BVBank = 970454,
    BacA_Bank = 970409,
    BaoViet_Bank = 970438,
    CAKE = 546034,
    CB_Bank = 970444,
    CIMB_Bank = 422589,
    Coop_Bank = 970446,
    DBS_Bank = 796500,
    DongA_Bank = 970406,
    Eximbank = 970431,
    GPBank = 970408,
    HDBank = 970437,
    HSBC = 458761,
    HongLeong_Bank = 970442,
    IBK_HCM = 970456,
    IBK_HN = 970455,
    Indovina_Bank = 970434,
    KBank = 668888,
    KienlongBank = 970452,
    Kookmin_Bank_HCM = 970463,
    Kookmin_Bank_HN = 970462,
    LPBank = 970449,
    MB_Bank = 970422,
    MSB = 970426,
    NCB = 970419,
    Nam_A_Bank = 970428,
    NongHyup_Bank = 801011,
    OCB = 970448,
    Ocean_Bank = 970414,
    PGBank = 970430,
    PVcomBank = 970412,
    Public_Bank_Vietnam = 970439,
    SCB = 970429,
    SHB = 970443,
    Sacombank = 970403,
    Saigon_Bank = 970400,
    SeABank = 970440,
    Shinhan_Bank = 970424,
    Standard_Chartered_Vietnam = 970410,
    TNEX = 9704261,
    TPBank = 970423,
    Techcombank = 970407,
    Timo = 963388,
    UBank_by_VPBank = 546035,
    United_Overseas_Bank_Vietnam = 970458,
    VIB = 970441,
    VPBank = 970432,
    VRB = 970421,
    VietABank = 970427,
    VietBank = 970433,
    Vietcombank = 970436,
    VietinBank = 970415,
    Woori_Bank = 970457,
}
