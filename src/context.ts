type AppContext = {
    uid: string;
    imei: string;
    cookie: string;
    userAgent: string;
    language: string;
    secretKey: string | null;
    zpwServiceMap: Record<string, string[]>;
}

export const appContext: Partial<AppContext> = {};
