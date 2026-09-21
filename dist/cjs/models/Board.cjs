'use strict';

exports.BoardType = void 0;
(function (BoardType) {
    BoardType[BoardType["Note"] = 1] = "Note";
    BoardType[BoardType["PinnedMessage"] = 2] = "PinnedMessage";
    BoardType[BoardType["Poll"] = 3] = "Poll";
})(exports.BoardType || (exports.BoardType = {}));
