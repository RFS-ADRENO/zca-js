export declare enum Reactions {
    HEART = "/-heart",
    LIKE = "/-strong",
    HAHA = ":>",
    WOW = ":o",
    CRY = ":-((",
    ANGRY = ":-h",
    KISS = ":-*",
    TEARS_OF_JOY = ":')",
    SHIT = "/-shit",
    ROSE = "/-rose",
    BROKEN_HEART = "/-break",
    DISLIKE = "/-weak",
    LOVE = ";xx",
    CONFUSED = ";-/",
    WINK = ";-)",
    FADE = "/-fade",
    SUN = "/-li",
    BIRTHDAY = "/-bd",
    BOMB = "/-bome",
    OK = "/-ok",
    PEACE = "/-v",
    THANKS = "/-thanks",
    PUNCH = "/-punch",
    SHARE = "/-share",
    PRAY = "_()_",
    NO = "/-no",
    BAD = "/-bad",
    LOVE_YOU = "/-loveu",
    SAD = "--b",
    VERY_SAD = ":((",
    COOL = "x-)",
    NERD = "8-)",
    BIG_SMILE = ";-d",
    SUNGLASSES = "b-)",
    NEUTRAL = ":--|",
    SAD_FACE = "p-(",
    BYE = ":-bye",
    SLEEPY = "|-)",
    WIPE = ":wipe",
    DIG = ":-dig",
    ANGUISH = "&-(",
    HANDCLAP = ":handclap",
    ANGRY_FACE = ">-|",
    F_CHAIR = ":-f",
    L_CHAIR = ":-l",
    R_CHAIR = ":-r",
    SILENT = ";-x",
    SURPRISE = ":-o",
    EMBARRASSED = ";-s",
    AFRAID = ";-a",
    SAD2 = ":-<",
    BIG_LAUGH = ":))",
    RICH = "$-)",
    BEER = "/-beer",
    NONE = ""
}
export type TReaction = {
    actionId: string;
    msgId: string;
    cliMsgId: string;
    msgType: string;
    uidFrom: string;
    idTo: string;
    dName?: string;
    content: {
        rMsg: {
            gMsgID: string;
            cMsgID: string;
            msgType: number;
        }[];
        rIcon: Reactions;
        rType: number;
        source: number;
    };
    ts: string;
    ttl: number;
};
export declare class Reaction {
    data: TReaction;
    threadId: string;
    isSelf: boolean;
    isGroup: boolean;
    constructor(uid: string, data: TReaction, isGroup: boolean);
}
