'use strict';

exports.ThreadType = void 0;
(function (ThreadType) {
    ThreadType[ThreadType["User"] = 0] = "User";
    ThreadType[ThreadType["Group"] = 1] = "Group";
})(exports.ThreadType || (exports.ThreadType = {}));
exports.DestType = void 0;
(function (DestType) {
    DestType[DestType["User"] = 3] = "User";
    DestType[DestType["Page"] = 5] = "Page";
})(exports.DestType || (exports.DestType = {}));
