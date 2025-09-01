export type ZBusinessPackage = {
    label?: Record<string, string> | null;
    pkgId: number; // @TODO: what is this?
};

export enum BusinessCategory {
    Other = 0,
    RealEstate = 1,
    TechnologyAndDevices = 2,
    TravelAndHospitality = 3,
    EducationAndTraining = 4,
    ShoppingAndRetail = 5,
    CosmeticsAndBeauty = 6,
    RestaurantAndCafe = 7,
    AutoAndMotorbike = 8,
    FashionAndApparel = 9,
    FoodAndBeverage = 10,
    MediaAndEntertainment = 11,
    InternalCommunications = 12,
    Transportation = 13,
    Telecommunications = 14,
}

export const BusinessCategoryName: Record<BusinessCategory, string> = {
    [BusinessCategory.Other]: "Dịch vụ khác (Không hiển thị)",
    [BusinessCategory.RealEstate]: "Bất động sản",
    [BusinessCategory.TechnologyAndDevices]: "Công nghệ & Thiết bị",
    [BusinessCategory.TravelAndHospitality]: "Du lịch & Lưu trú",
    [BusinessCategory.EducationAndTraining]: "Giáo dục & Đào tạo",
    [BusinessCategory.ShoppingAndRetail]: "Mua sắm & Bán lẻ",
    [BusinessCategory.CosmeticsAndBeauty]: "Mỹ phẩm & Làm đẹp",
    [BusinessCategory.RestaurantAndCafe]: "Nhà hàng & Quán",
    [BusinessCategory.AutoAndMotorbike]: "Ô tô & Xe máy",
    [BusinessCategory.FashionAndApparel]: "Thời trang & May mặc",
    [BusinessCategory.FoodAndBeverage]: "Thực phẩm & Đồ uống",
    [BusinessCategory.MediaAndEntertainment]: "Truyền thông & Giải trí",
    [BusinessCategory.InternalCommunications]: "Truyền thông nội bộ",
    [BusinessCategory.Transportation]: "Vận tải",
    [BusinessCategory.Telecommunications]: "Viễn thông",
};
