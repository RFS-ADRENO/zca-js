export enum ThreadType {
    User,
    Group,
}

export enum DestType {
    Group = 1,
    User = 3,
    Page = 5,
}

export enum Gender {
    Male = 0,
    Female = 1,
}

/**
 * @note Bank codes list after Mitm on Mobile and Bank's supported by Zalo
 * @documents https://developers.zalo.me/docs/zalo-notification-service/phu-luc/danh-sach-bin-code - docs missing bin code and short_name bank
 */
export enum BinBankCard {
    /**
     * NH TMCP An Bình
     */
    ABBank = 970425,
    /**
     * NH TMCP Á Châu
     */
    ACB = 970416,
    /**
     * NH Nông nghiệp và Phát triển Nông thôn Việt Nam
     */
    Agribank = 970405,
    /**
     * NH TMCP Đầu tư và Phát triển Việt Nam
     */
    BIDV = 970418,
    /**
     * NH TMCP Bản Việt
     */
    BVBank = 970454,
    /**
     * NH TMCP Bắc Á
     */
    BacA_Bank = 970409,
    /**
     * NH TMCP Bảo Việt
     */
    BaoViet_Bank = 970438,
    /**
     * NH số CAKE by VPBank - TMCP Việt Nam Thịnh Vượng
     */
    CAKE = 546034,
    /**
     * NH Thương mại TNHH MTV Xây dựng Việt Nam
     */
    CB_Bank = 970444,
    /**
     * NH TNHH MTV CIMB Việt Nam
     */
    CIMB_Bank = 422589,
    /**
     * NH Hợp tác xã Việt Nam
     */
    Coop_Bank = 970446,
    /**
     * NH TNHH MTV Phát triển Singapore - CN TP. Hồ Chí Minh
     */
    DBS_Bank = 796500,
    /**
     * NH TMCP Đông Á
     */
    DongA_Bank = 970406,
    /**
     * NH TMCP Xuất Nhập khẩu Việt Nam
     */
    Eximbank = 970431,
    /**
     * NH TMCP Dầu khí Toàn cầu
     */
    GPBank = 970408,
    /**
     * NH TMCP Phát triển TP. Hồ Chí Minh
     */
    HDBank = 970437,
    /**
     * NH TNHH MTV HSBC (Việt Nam)
     */
    HSBC = 458761,
    /**
     * NH TNHH MTV Hong Leong Việt Nam
     */
    HongLeong_Bank = 970442,
    /**
     * NH Công nghiệp Hàn Quốc - CN TP. Hồ Chí Minh
     */
    IBK_HCM = 970456,
    /**
     * NH Công nghiệp Hàn Quốc - CN Hà Nội
     */
    IBK_HN = 970455,
    /**
     * NH TNHH Indovina
     */
    Indovina_Bank = 970434,
    /**
     * NH Đại chúng TNHH Kasikornbank - CN TP. Hồ Chí Minh
     */
    KBank = 668888,
    /**
     * NH TMCP Kiên Long
     */
    KienlongBank = 970452,
    /**
     * NH Kookmin - CN TP. Hồ Chí Minh
     */
    Kookmin_Bank_HCM = 970463,
    /**
     * NH Kookmin - CN Hà Nội
     */
    Kookmin_Bank_HN = 970462,
    /**
     * NH TMCP Lộc Phát Việt Nam
     */
    LPBank = 970449,
    /**
     * NH TMCP Quân đội
     */
    MB_Bank = 970422,
    /**
     * NH TMCP Hàng Hải
     */
    MSB = 970426,
    /**
     * NH TMCP Quốc Dân
     */
    NCB = 970419,
    /**
     * NH TMCP Nam Á
     */
    Nam_A_Bank = 970428,
    /**
     * NH Nonghyup - CN Hà Nội
     */
    NongHyup_Bank = 801011,
    /**
     * NH TMCP Phương Đông
     */
    OCB = 970448,
    /**
     * NH Thương mại TNHH MTV Đại Dương
     */
    Ocean_Bank = 970414,
    /**
     * NH TMCP Thịnh vượng và Phát triển
     */
    PGBank = 970430,
    /**
     * NH TMCP Đại Chúng Việt Nam
     */
    PVcomBank = 970412,
    /**
     * NH TNHH MTV Public Việt Nam
     */
    Public_Bank_Vietnam = 970439,
    /**
     * NH TMCP Sài Gòn
     */
    SCB = 970429,
    /**
     * NH TMCP Sài Gòn - Hà Nội
     */
    SHB = 970443,
    /**
     * NH TMCP Sài Gòn Thương Tín
     */
    Sacombank = 970403,
    /**
     * NH TMCP Sài Gòn Công Thương
     */
    Saigon_Bank = 970400,
    /**
     * NH TMCP Đông Nam Á
     */
    SeABank = 970440,
    /**
     * NH TNHH MTV Shinhan Việt Nam
     */
    Shinhan_Bank = 970424,
    /**
     * NH TNHH MTV Standard Chartered Bank Việt Nam
     */
    Standard_Chartered_Vietnam = 970410,
    /**
     * NH số TNEX
     */
    TNEX = 9704261,
    /**
     * NH TMCP Tiên Phong
     */
    TPBank = 970423,
    /**
     * NH TMCP Kỹ thương Việt Nam
     */
    Techcombank = 970407,
    /**
     * NH số Timo by Bản Việt Bank
     */
    Timo = 963388,
    /**
     * NH số UBank by VPBank
     */
    UBank = 546035,
    /**
     * NH United Overseas Bank Việt Nam
     */
    United_Overseas_Bank_Vietnam = 970458,
    /**
     * NH TMCP Quốc tế Việt Nam
     */
    VIB = 970441,
    /**
     * NH TMCP Việt Nam Thịnh Vượng
     */
    VPBank = 970432,
    /**
     * NH Liên doanh Việt - Nga
     */
    VRB = 970421,
    /**
     * NH TMCP Việt Á
     */
    VietABank = 970427,
    /**
     * NH TMCP Việt Nam Thương Tín
     */
    VietBank = 970433,
    /**
     * NH TMCP Ngoại Thương Việt Nam
     */
    Vietcombank = 970436,
    /**
     * NH TMCP Công thương Việt Nam
     */
    VietinBank = 970415,
    /**
     * NH TNHH MTV Woori Việt Nam
     */
    Woori_Bank = 970457,
}
