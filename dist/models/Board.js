export var BoardType;
(function (BoardType) {
    BoardType[BoardType["Note"] = 1] = "Note";
    BoardType[BoardType["PinnedMessage"] = 2] = "PinnedMessage";
    BoardType[BoardType["Poll"] = 3] = "Poll";
})(BoardType || (BoardType = {}));
