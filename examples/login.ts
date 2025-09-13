import type { Credentials } from "../src";

import { Zalo } from "../src";
import fs from "node:fs";

const zalo = new Zalo();
const credentialsPath = "./examples/credentials.json";

function validateCredentials(credentials: Partial<Credentials>): credentials is Credentials {
    return !!credentials.cookie && !!credentials.imei && !!credentials.userAgent;
}

function getCredentials() {
    if (!fs.existsSync(credentialsPath)) {
        return null;
    }

    const raw = fs.readFileSync(credentialsPath, "utf-8") || "{}";
    const credentials = JSON.parse(raw);
    return validateCredentials(credentials) ? credentials : null;
}

const credentials = getCredentials();

const isValidCredentials = credentials !== null;
const api = isValidCredentials ? await zalo.login(credentials) : await zalo.loginQR();

if (!isValidCredentials) {
    const apiContext = api.getContext();
    const credentials: Credentials = {
        cookie: apiContext.cookie.toJSON()?.cookies || [],
        imei: apiContext.imei,
        userAgent: apiContext.userAgent,
    };

    fs.writeFileSync(credentialsPath, JSON.stringify(credentials, null, 2), "utf-8");
}

const myProfile = await api.fetchAccountInfo();
console.log("My profile:", myProfile);
