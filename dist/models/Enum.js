export var ThreadType;
(function (ThreadType) {
    ThreadType[ThreadType["User"] = 0] = "User";
    ThreadType[ThreadType["Group"] = 1] = "Group";
})(ThreadType || (ThreadType = {}));
export var DestType;
(function (DestType) {
    DestType[DestType["Group"] = 1] = "Group";
    DestType[DestType["User"] = 3] = "User";
    DestType[DestType["Page"] = 5] = "Page";
})(DestType || (DestType = {}));
export var Gender;
(function (Gender) {
    Gender[Gender["Male"] = 0] = "Male";
    Gender[Gender["Female"] = 1] = "Female";
})(Gender || (Gender = {}));
export var AvatarSize;
(function (AvatarSize) {
    AvatarSize[AvatarSize["Small"] = 120] = "Small";
    /** @experimental Use only if you know what you're doing. */
    AvatarSize[AvatarSize["Medium"] = 180] = "Medium";
    AvatarSize[AvatarSize["Large"] = 240] = "Large";
    /** @experimental Use only if you know what you're doing. */
    AvatarSize[AvatarSize["ExtraLarge"] = 360] = "ExtraLarge";
})(AvatarSize || (AvatarSize = {}));
