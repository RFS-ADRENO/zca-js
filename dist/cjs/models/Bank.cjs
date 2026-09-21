'use strict';

/**
 * @note Bank codes list after Mitm on Mobile, WEB and Bank's supported by Zalo
 * @documents https://developers.zalo.me/docs/zalo-notification-service/phu-luc/danh-sach-bin-code - docs missing bin code and short_name bank
 */
exports.BinBankCard = void 0;
(function (BinBankCard) {
    /**
     * NH TMCP An Bình
     */
    BinBankCard[BinBankCard["ABBank"] = 970425] = "ABBank";
    /**
     * NH TMCP Á Châu
     */
    BinBankCard[BinBankCard["ACB"] = 970416] = "ACB";
    /**
     * NH Nông nghiệp và Phát triển Nông thôn Việt Nam
     */
    BinBankCard[BinBankCard["Agribank"] = 970405] = "Agribank";
    /**
     * NH TMCP Đầu tư và Phát triển Việt Nam
     */
    BinBankCard[BinBankCard["BIDV"] = 970418] = "BIDV";
    /**
     * Ngân hàng BNP Paribas - CN TP. Hồ Chí Minh
     */
    BinBankCard[BinBankCard["BNP_Paribas_HCM"] = 963666] = "BNP_Paribas_HCM";
    /**
     * Ngân hàng BNP Paribas - CN Hà Nội
     */
    BinBankCard[BinBankCard["BNP_Paribas_HN"] = 963668] = "BNP_Paribas_HN";
    /**
     * NH TMCP Bản Việt
     */
    BinBankCard[BinBankCard["BVBank"] = 970454] = "BVBank";
    /**
     * NH TMCP Bắc Á
     */
    BinBankCard[BinBankCard["BacA_Bank"] = 970409] = "BacA_Bank";
    /**
     * NH TMCP Bảo Việt
     */
    BinBankCard[BinBankCard["BaoViet_Bank"] = 970438] = "BaoViet_Bank";
    /**
     * NH số CAKE by VPBank - TMCP Việt Nam Thịnh Vượng
     */
    BinBankCard[BinBankCard["CAKE"] = 546034] = "CAKE";
    /**
     * Ngân hàng Cathay United - CN TP. Hồ Chí Minh
     */
    BinBankCard[BinBankCard["Cathay_United_HCM"] = 168999] = "Cathay_United_HCM";
    /**
     * NH Thương mại TNHH MTV Xây dựng Việt Nam
     *
     * @note Also observed as "VCBNeo" in supported banks list (same bin) - Old is bank: CB_Bank
     */
    BinBankCard[BinBankCard["VCBNeo"] = 970444] = "VCBNeo";
    /**
     * NH TNHH MTV CIMB Việt Nam
     */
    BinBankCard[BinBankCard["CIMB_Bank"] = 422589] = "CIMB_Bank";
    /**
     * NH Hợp tác xã Việt Nam
     */
    BinBankCard[BinBankCard["Coop_Bank"] = 970446] = "Coop_Bank";
    /**
     * NH TNHH MTV Phát triển Singapore - CN TP. Hồ Chí Minh
     */
    BinBankCard[BinBankCard["DBS_Bank"] = 796500] = "DBS_Bank";
    /**
     * NH TMCP Đông Á
     */
    BinBankCard[BinBankCard["DongA_Bank"] = 970406] = "DongA_Bank";
    /**
     * NH TMCP Xuất Nhập khẩu Việt Nam
     */
    BinBankCard[BinBankCard["Eximbank"] = 970431] = "Eximbank";
    /**
     * Ngân hàng Citibank Việt Nam
     */
    BinBankCard[BinBankCard["Citibank"] = 533948] = "Citibank";
    /**
     * NH TMCP Dầu khí Toàn cầu
     */
    BinBankCard[BinBankCard["GPBank"] = 970408] = "GPBank";
    /**
     * NH TMCP Phát triển TP. Hồ Chí Minh
     */
    BinBankCard[BinBankCard["HDBank"] = 970437] = "HDBank";
    /**
     * NH TNHH MTV HSBC (Việt Nam)
     */
    BinBankCard[BinBankCard["HSBC"] = 458761] = "HSBC";
    /**
     * NH TNHH MTV Hong Leong Việt Nam
     */
    BinBankCard[BinBankCard["HongLeong_Bank"] = 970442] = "HongLeong_Bank";
    /**
     * NH Công nghiệp Hàn Quốc - CN TP. Hồ Chí Minh
     */
    BinBankCard[BinBankCard["IBK_HCM"] = 970456] = "IBK_HCM";
    /**
     * NH Công nghiệp Hàn Quốc - CN Hà Nội
     */
    BinBankCard[BinBankCard["IBK_HN"] = 970455] = "IBK_HN";
    /**
     * NH TNHH Indovina
     */
    BinBankCard[BinBankCard["Indovina_Bank"] = 970434] = "Indovina_Bank";
    /**
     * NH Đại chúng TNHH Kasikornbank - CN TP. Hồ Chí Minh
     */
    BinBankCard[BinBankCard["KBank"] = 668888] = "KBank";
    /**
     * NH TMCP Kiên Long
     */
    BinBankCard[BinBankCard["KienlongBank"] = 970452] = "KienlongBank";
    /**
     * NH Kookmin - CN TP. Hồ Chí Minh
     */
    BinBankCard[BinBankCard["Kookmin_Bank_HCM"] = 970463] = "Kookmin_Bank_HCM";
    /**
     * NH Kookmin - CN Hà Nội
     */
    BinBankCard[BinBankCard["Kookmin_Bank_HN"] = 970462] = "Kookmin_Bank_HN";
    /**
     * Liobank by OCB
     */
    BinBankCard[BinBankCard["Liobank"] = 963369] = "Liobank";
    /**
     * NH TMCP Lộc Phát Việt Nam
     */
    BinBankCard[BinBankCard["LPBank"] = 970449] = "LPBank";
    /**
     * NH TMCP Quân đội
     */
    BinBankCard[BinBankCard["MB_Bank"] = 970422] = "MB_Bank";
    /**
     * NH TMCP Hàng Hải
     */
    BinBankCard[BinBankCard["MSB"] = 970426] = "MSB";
    /**
     * MoMo
     */
    BinBankCard[BinBankCard["MoMo"] = 971025] = "MoMo";
    /**
     * NH TMCP Quốc Dân
     */
    BinBankCard[BinBankCard["NCB"] = 970419] = "NCB";
    /**
     * NH TMCP Nam Á
     */
    BinBankCard[BinBankCard["Nam_A_Bank"] = 970428] = "Nam_A_Bank";
    /**
     * NH Nonghyup - CN Hà Nội
     */
    BinBankCard[BinBankCard["NongHyup_Bank"] = 801011] = "NongHyup_Bank";
    /**
     * NH TMCP Phương Đông
     */
    BinBankCard[BinBankCard["OCB"] = 970448] = "OCB";
    /**
     * NH Thương mại TNHH MTV Đại Dương
     */
    BinBankCard[BinBankCard["Ocean_Bank"] = 970414] = "Ocean_Bank";
    /**
     * NH TMCP Thịnh vượng và Phát triển
     */
    BinBankCard[BinBankCard["PGBank"] = 970430] = "PGBank";
    /**
     * NH TMCP Đại Chúng Việt Nam
     */
    BinBankCard[BinBankCard["PVcomBank"] = 970412] = "PVcomBank";
    /**
     * NH TNHH MTV Public Việt Nam
     */
    BinBankCard[BinBankCard["Public_Bank_Vietnam"] = 970439] = "Public_Bank_Vietnam";
    /**
     * NH TMCP Sài Gòn
     */
    BinBankCard[BinBankCard["SCB"] = 970429] = "SCB";
    /**
     * NH TMCP Sài Gòn - Hà Nội
     */
    BinBankCard[BinBankCard["SHB"] = 970443] = "SHB";
    /**
     * NH TMCP Sài Gòn Thương Tín
     */
    BinBankCard[BinBankCard["Sacombank"] = 970403] = "Sacombank";
    /**
     * NH TMCP Sài Gòn Công Thương
     */
    BinBankCard[BinBankCard["Saigon_Bank"] = 970400] = "Saigon_Bank";
    /**
     * NH TMCP Đông Nam Á
     */
    BinBankCard[BinBankCard["SeABank"] = 970440] = "SeABank";
    /**
     * NH TNHH MTV Shinhan Việt Nam
     */
    BinBankCard[BinBankCard["Shinhan_Bank"] = 970424] = "Shinhan_Bank";
    /**
     * NH TNHH MTV Standard Chartered Bank Việt Nam
     */
    BinBankCard[BinBankCard["Standard_Chartered_Vietnam"] = 970410] = "Standard_Chartered_Vietnam";
    /**
     * NH số TNEX
     */
    BinBankCard[BinBankCard["TNEX"] = 963326] = "TNEX";
    /**
     * NH TMCP Tiên Phong
     */
    BinBankCard[BinBankCard["TPBank"] = 970423] = "TPBank";
    /**
     * NH TMCP Kỹ thương Việt Nam
     */
    BinBankCard[BinBankCard["Techcombank"] = 970407] = "Techcombank";
    /**
     * NH số Timo by Bản Việt Bank
     */
    BinBankCard[BinBankCard["Timo"] = 963388] = "Timo";
    /**
     * NH số UBank by VPBank
     */
    BinBankCard[BinBankCard["UBank"] = 546035] = "UBank";
    /**
     * NH United Overseas Bank Việt Nam
     */
    BinBankCard[BinBankCard["United_Overseas_Bank_Vietnam"] = 970458] = "United_Overseas_Bank_Vietnam";
    /**
     * NH TMCP Quốc tế Việt Nam
     */
    BinBankCard[BinBankCard["VIB"] = 970441] = "VIB";
    /**
     * NH TMCP Việt Nam Thịnh Vượng
     */
    BinBankCard[BinBankCard["VPBank"] = 970432] = "VPBank";
    /**
     * NH Liên doanh Việt - Nga
     */
    BinBankCard[BinBankCard["VRB"] = 970421] = "VRB";
    /**
     * NH TMCP Việt Á
     */
    BinBankCard[BinBankCard["VietABank"] = 970427] = "VietABank";
    /**
     * NH TMCP Việt Nam Thương Tín
     */
    BinBankCard[BinBankCard["VietBank"] = 970433] = "VietBank";
    /**
     * NH TMCP Ngoại Thương Việt Nam
     */
    BinBankCard[BinBankCard["Vietcombank"] = 970436] = "Vietcombank";
    /**
     * NH TMCP Công thương Việt Nam
     */
    BinBankCard[BinBankCard["VietinBank"] = 970415] = "VietinBank";
    /**
     * NH TNHH MTV Woori Việt Nam
     */
    BinBankCard[BinBankCard["Woori_Bank"] = 970457] = "Woori_Bank";
})(exports.BinBankCard || (exports.BinBankCard = {}));
