'use strict';

exports.ThreadType = void 0;
(function (ThreadType) {
    ThreadType[ThreadType["User"] = 0] = "User";
    ThreadType[ThreadType["Group"] = 1] = "Group";
})(exports.ThreadType || (exports.ThreadType = {}));
exports.DestType = void 0;
(function (DestType) {
    DestType[DestType["Group"] = 1] = "Group";
    DestType[DestType["User"] = 3] = "User";
    DestType[DestType["Page"] = 5] = "Page";
})(exports.DestType || (exports.DestType = {}));
exports.Gender = void 0;
(function (Gender) {
    Gender[Gender["Male"] = 0] = "Male";
    Gender[Gender["Female"] = 1] = "Female";
})(exports.Gender || (exports.Gender = {}));
exports.AvatarSize = void 0;
(function (AvatarSize) {
    AvatarSize[AvatarSize["Small"] = 120] = "Small";
    /** @experimental Use only if you know what you're doing. */
    AvatarSize[AvatarSize["Medium"] = 180] = "Medium";
    AvatarSize[AvatarSize["Large"] = 240] = "Large";
    /** @experimental Use only if you know what you're doing. */
    AvatarSize[AvatarSize["ExtraLarge"] = 360] = "ExtraLarge";
})(exports.AvatarSize || (exports.AvatarSize = {}));
