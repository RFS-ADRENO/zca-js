export var Reactions;
(function (Reactions) {
    Reactions["HEART"] = "/-heart";
    Reactions["LIKE"] = "/-strong";
    Reactions["HAHA"] = ":>";
    Reactions["WOW"] = ":o";
    Reactions["CRY"] = ":-((";
    Reactions["ANGRY"] = ":-h";
    Reactions["KISS"] = ":-*";
    Reactions["TEARS_OF_JOY"] = ":')";
    Reactions["SHIT"] = "/-shit";
    Reactions["ROSE"] = "/-rose";
    Reactions["BROKEN_HEART"] = "/-break";
    Reactions["DISLIKE"] = "/-weak";
    Reactions["LOVE"] = ";xx";
    Reactions["CONFUSED"] = ";-/";
    Reactions["WINK"] = ";-)";
    Reactions["FADE"] = "/-fade";
    Reactions["SUN"] = "/-li";
    Reactions["BIRTHDAY"] = "/-bd";
    Reactions["BOMB"] = "/-bome";
    Reactions["OK"] = "/-ok";
    Reactions["PEACE"] = "/-v";
    Reactions["THANKS"] = "/-thanks";
    Reactions["PUNCH"] = "/-punch";
    Reactions["SHARE"] = "/-share";
    Reactions["PRAY"] = "_()_";
    Reactions["NO"] = "/-no";
    Reactions["BAD"] = "/-bad";
    Reactions["LOVE_YOU"] = "/-loveu";
    Reactions["SAD"] = "--b";
    Reactions["VERY_SAD"] = ":((";
    Reactions["COOL"] = "x-)";
    Reactions["NERD"] = "8-)";
    Reactions["BIG_SMILE"] = ";-d";
    Reactions["SUNGLASSES"] = "b-)";
    Reactions["NEUTRAL"] = ":--|";
    Reactions["SAD_FACE"] = "p-(";
    Reactions["BYE"] = ":-bye";
    Reactions["SLEEPY"] = "|-)";
    Reactions["WIPE"] = ":wipe";
    Reactions["DIG"] = ":-dig";
    Reactions["ANGUISH"] = "&-(";
    Reactions["HANDCLAP"] = ":handclap";
    Reactions["ANGRY_FACE"] = ">-|";
    Reactions["F_CHAIR"] = ":-f";
    Reactions["L_CHAIR"] = ":-l";
    Reactions["R_CHAIR"] = ":-r";
    Reactions["SILENT"] = ";-x";
    Reactions["SURPRISE"] = ":-o";
    Reactions["EMBARRASSED"] = ";-s";
    Reactions["AFRAID"] = ";-a";
    Reactions["SAD2"] = ":-<";
    Reactions["BIG_LAUGH"] = ":))";
    Reactions["RICH"] = "$-)";
    Reactions["BEER"] = "/-beer";
    Reactions["NONE"] = "";
})(Reactions || (Reactions = {}));
export class Reaction {
    constructor(uid, data, isGroup) {
        this.data = data;
        this.threadId = isGroup || data.uidFrom == "0" ? data.idTo : data.uidFrom;
        this.isSelf = data.uidFrom == "0";
        this.isGroup = isGroup;
        if (data.idTo == "0")
            data.idTo = uid;
        if (data.uidFrom == "0")
            data.uidFrom = uid;
    }
}
