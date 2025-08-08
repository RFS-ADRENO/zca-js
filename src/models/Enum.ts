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
    ABBank = 970425,                       // NH TMCP An Bình
    ACB = 970416,                          // NH TMCP Á Châu
    Agribank = 970405,                     // NH Nông nghiệp và Phát triển Nông thôn Việt Nam
    BIDV = 970418,                         // NH TMCP Đầu tư và Phát triển Việt Nam
    BVBank = 970454,                       // NH TMCP Bản Việt
    BacA_Bank = 970409,                    // NH TMCP Bắc Á
    BaoViet_Bank = 970438,                 // NH TMCP Bảo Việt
    CAKE = 546034,                         // NH số CAKE by VPBank - TMCP Việt Nam Thịnh Vượng
    CB_Bank = 970444,                      // NH Thương mại TNHH MTV Xây dựng Việt Nam
    CIMB_Bank = 422589,                    // NH TNHH MTV CIMB Việt Nam
    Coop_Bank = 970446,                    // NH Hợp tác xã Việt Nam
    DBS_Bank = 796500,                     // NH TNHH MTV Phát triển Singapore - CN TP. Hồ Chí Minh
    DongA_Bank = 970406,                   // NH TMCP Đông Á
    Eximbank = 970431,                     // NH TMCP Xuất Nhập khẩu Việt Nam
    GPBank = 970408,                       // NH TMCP Dầu khí Toàn cầu
    HDBank = 970437,                       // NH TMCP Phát triển TP. Hồ Chí Minh
    HSBC = 458761,                         // NH TNHH MTV HSBC (Việt Nam)
    HongLeong_Bank = 970442,               // NH TNHH MTV Hong Leong Việt Nam
    IBK_HCM = 970456,                      // NH Công nghiệp Hàn Quốc - CN TP. Hồ Chí Minh
    IBK_HN = 970455,                       // NH Công nghiệp Hàn Quốc - CN Hà Nội
    Indovina_Bank = 970434,                // NH TNHH Indovina
    KBank = 668888,                        // NH Đại chúng TNHH Kasikornbank - CN TP. Hồ Chí Minh
    KienlongBank = 970452,                 // NH TMCP Kiên Long
    Kookmin_Bank_HCM = 970463,             // NH Kookmin - CN TP. Hồ Chí Minh
    Kookmin_Bank_HN = 970462,              // NH Kookmin - CN Hà Nội
    LPBank = 970449,                       // NH TMCP Lộc Phát Việt Nam
    MB_Bank = 970422,                      // NH TMCP Quân đội
    MSB = 970426,                          // NH TMCP Hàng Hải
    NCB = 970419,                          // NH TMCP Quốc Dân
    Nam_A_Bank = 970428,                   // NH TMCP Nam Á
    NongHyup_Bank = 801011,                // NH Nonghyup - CN Hà Nội
    OCB = 970448,                          // NH TMCP Phương Đông
    Ocean_Bank = 970414,                   // NH Thương mại TNHH MTV Đại Dương
    PGBank = 970430,                       // NH TMCP Thịnh vượng và Phát triển
    PVcomBank = 970412,                    // NH TMCP Đại Chúng Việt Nam
    Public_Bank_Vietnam = 970439,          // NH TNHH MTV Public Việt Nam
    SCB = 970429,                          // NH TMCP Sài Gòn
    SHB = 970443,                          // NH TMCP Sài Gòn - Hà Nội
    Sacombank = 970403,                    // NH TMCP Sài Gòn Thương Tín
    Saigon_Bank = 970400,                  // NH TMCP Sài Gòn Công Thương
    SeABank = 970440,                      // NH TMCP Đông Nam Á
    Shinhan_Bank = 970424,                 // NH TNHH MTV Shinhan Việt Nam
    Standard_Chartered_Vietnam = 970410,   // NH TNHH MTV Standard Chartered Bank Việt Nam
    TNEX = 9704261,                        // NH số TNEX
    TPBank = 970423,                       // NH TMCP Tiên Phong
    Techcombank = 970407,                  // NH TMCP Kỹ thương Việt Nam
    Timo = 963388,                         // NH số Timo by Bản Việt Bank
    UBank = 546035,                        // NH số UBank by VPBank
    United_Overseas_Bank_Vietnam = 970458, // NH United Overseas Bank Việt Nam
    VIB = 970441,                          // NH TMCP Quốc tế Việt Nam
    VPBank = 970432,                       // NH TMCP Việt Nam Thịnh Vượng
    VRB = 970421,                          // NH Liên doanh Việt - Nga
    VietABank = 970427,                    // NH TMCP Việt Á
    VietBank = 970433,                     // NH TMCP Việt Nam Thương Tín
    Vietcombank = 970436,                  // NH TMCP Ngoại Thương Việt Nam
    VietinBank = 970415,                   // NH TMCP Công thương Việt Nam
    Woori_Bank = 970457,                   // NH TNHH MTV Woori Việt Nam
}
