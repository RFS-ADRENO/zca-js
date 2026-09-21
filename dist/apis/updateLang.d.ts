export declare enum UpdateLangAvailableLanguages {
    VI = "VI",
    EN = "EN"
}
export type UpdateLangResponse = "";
export declare const updateLangFactory: (ctx: import("../context.js").ContextBase, api: import("../apis.js").API) => (language?: UpdateLangAvailableLanguages) => Promise<"">;
