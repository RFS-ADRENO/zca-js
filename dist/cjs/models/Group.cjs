'use strict';

exports.GroupTopicType = void 0;
(function (GroupTopicType) {
    GroupTopicType[GroupTopicType["Note"] = 0] = "Note";
    GroupTopicType[GroupTopicType["Message"] = 2] = "Message";
    GroupTopicType[GroupTopicType["Poll"] = 3] = "Poll";
})(exports.GroupTopicType || (exports.GroupTopicType = {}));
exports.GroupType = void 0;
(function (GroupType) {
    GroupType[GroupType["Group"] = 1] = "Group";
    GroupType[GroupType["Community"] = 2] = "Community";
})(exports.GroupType || (exports.GroupType = {}));
