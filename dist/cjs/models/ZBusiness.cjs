'use strict';

exports.BusinessCategory = void 0;
(function (BusinessCategory) {
    BusinessCategory[BusinessCategory["Other"] = 0] = "Other";
    BusinessCategory[BusinessCategory["RealEstate"] = 1] = "RealEstate";
    BusinessCategory[BusinessCategory["TechnologyAndDevices"] = 2] = "TechnologyAndDevices";
    BusinessCategory[BusinessCategory["TravelAndHospitality"] = 3] = "TravelAndHospitality";
    BusinessCategory[BusinessCategory["EducationAndTraining"] = 4] = "EducationAndTraining";
    BusinessCategory[BusinessCategory["ShoppingAndRetail"] = 5] = "ShoppingAndRetail";
    BusinessCategory[BusinessCategory["CosmeticsAndBeauty"] = 6] = "CosmeticsAndBeauty";
    BusinessCategory[BusinessCategory["RestaurantAndCafe"] = 7] = "RestaurantAndCafe";
    BusinessCategory[BusinessCategory["AutoAndMotorbike"] = 8] = "AutoAndMotorbike";
    BusinessCategory[BusinessCategory["FashionAndApparel"] = 9] = "FashionAndApparel";
    BusinessCategory[BusinessCategory["FoodAndBeverage"] = 10] = "FoodAndBeverage";
    BusinessCategory[BusinessCategory["MediaAndEntertainment"] = 11] = "MediaAndEntertainment";
    BusinessCategory[BusinessCategory["InternalCommunications"] = 12] = "InternalCommunications";
    BusinessCategory[BusinessCategory["Transportation"] = 13] = "Transportation";
    BusinessCategory[BusinessCategory["Telecommunications"] = 14] = "Telecommunications";
})(exports.BusinessCategory || (exports.BusinessCategory = {}));
const BusinessCategoryName = {
    [exports.BusinessCategory.Other]: "Dịch vụ khác (Không hiển thị)",
    [exports.BusinessCategory.RealEstate]: "Bất động sản",
    [exports.BusinessCategory.TechnologyAndDevices]: "Công nghệ & Thiết bị",
    [exports.BusinessCategory.TravelAndHospitality]: "Du lịch & Lưu trú",
    [exports.BusinessCategory.EducationAndTraining]: "Giáo dục & Đào tạo",
    [exports.BusinessCategory.ShoppingAndRetail]: "Mua sắm & Bán lẻ",
    [exports.BusinessCategory.CosmeticsAndBeauty]: "Mỹ phẩm & Làm đẹp",
    [exports.BusinessCategory.RestaurantAndCafe]: "Nhà hàng & Quán",
    [exports.BusinessCategory.AutoAndMotorbike]: "Ô tô & Xe máy",
    [exports.BusinessCategory.FashionAndApparel]: "Thời trang & May mặc",
    [exports.BusinessCategory.FoodAndBeverage]: "Thực phẩm & Đồ uống",
    [exports.BusinessCategory.MediaAndEntertainment]: "Truyền thông & Giải trí",
    [exports.BusinessCategory.InternalCommunications]: "Truyền thông nội bộ",
    [exports.BusinessCategory.Transportation]: "Vận tải",
    [exports.BusinessCategory.Telecommunications]: "Viễn thông",
};

exports.BusinessCategoryName = BusinessCategoryName;
