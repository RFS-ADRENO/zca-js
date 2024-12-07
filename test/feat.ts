/**
 * Xem hướng dẫn sử dụng tại:
 * @tutorial https://drive.google.com/file/d/1xuGHYCu-5H28er4bXZEFjTCSGKcOekhi/view?usp=sharing
 */

import fs from "node:fs";
import { createInterface } from "node:readline";
import { Zalo, type Credentials } from "../src/index.js";
import { decodeAES, decodeEventData } from "../src/utils.js";

const CREDENTIALS_PATH = "./test/credentials.json";
const SECRET_PATH = "./test/secret.test.txt";

let gotFresh = false;

const credentials: Credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf-8"));
let secretKey = await getSecretKey(),
    cipher_key = "";

const rl = createInterface(process.stdin, process.stdout);
const cannotDecodeALert = () =>
    console.log(
        "\n\x1b[31mKhông thể giải mã, đảm bảo bạn lấy dữ liệu từ đúng tài khoản và trình duyệt của tài khoản đã đăng nhập\x1b[0m\n",
    );
const exit = () => {
    console.log();
    process.exit();
};

main();

async function main() {
    console.log();
    if (secretKey && !gotFresh) {
        const shouldGetFreshKey = await promptForFreshKey();
        if (shouldGetFreshKey) {
            secretKey = await getFreshKey();
        }
    }

    prompt();
}

function prompt() {
    console.log();
    rl.question("Bạn muốn giải mã hóa loại nào? [1] HTTP, [2] Websocket, [3] thoát?: ", (answer) => {
        if (answer == "1") {
            decodeHTTP();
        } else if (answer == "2") {
            decodeWebsocket();
        } else if (answer == "3") exit();
        else {
            prompt();
        }
    });
}

function decodeHTTP() {
    rl.question("\n[ HTTP ] Dán đoạn dữ liệu bị mã hóa hoặc gõ exit để thoát:\n\n", (encoded) => {
        if (encoded.length == 0) return decodeHTTP();
        if (encoded == "exit") return prompt();

        if (encoded.startsWith('"') && encoded.endsWith('"')) encoded = JSON.parse(encoded);

        try {
            const decoded = decodeAES(secretKey, encoded);
            if (decoded == null) {
                cannotDecodeALert();
                return decodeHTTP();
            }

            const parsed = JSON.stringify(JSON.parse(decoded), null, 2);

            console.log();
            console.log("=========== HTTP ===========");
            console.log(parsed);
            console.log("============================");
            console.log();

            return decodeHTTP();
        } catch {
            cannotDecodeALert();
            return decodeHTTP();
        }
    });
}

async function decodeWebsocket() {
    if (!cipher_key) {
        console.log(
            "Mở devtools trên trình duyệt tại https://chat.zalo.me, vào tab Network -> WS\nMở tin nhắn đầu tiên, đổi sang định dạng UTF-8",
        );
        cipher_key = await promptForCipherKey();
    }

    rl.question("\n[ WEBSOCKET ] Dán đoạn dữ liệu bị mã hóa hoặc gõ exit để thoát:\n\n", async (encoded) => {
        if (encoded.length == 0) return decodeWebsocket();
        if (encoded == "exit") return prompt();

        try {
            const decoded = await decodeEventData({ data: encoded }, cipher_key);
            if (decoded == null) {
                cannotDecodeALert();
                return decodeWebsocket();
            }

            const parsed = JSON.stringify(decoded, null, 2);

            console.log();
            console.log("=========== WEBSOCKET ===========");
            console.log(parsed);
            console.log("=================================");
            console.log();

            return decodeWebsocket();
        } catch {
            cannotDecodeALert();
            return decodeWebsocket();
        }
    });
}

function promptForFreshKey() {
    return new Promise<boolean>((resolve) => {
        rl.question("Tìm thấy khóa bí mật, bạn có muốn tái sử dụng? (y/n): ", (answer) => {
            if (answer.toLowerCase() == "y") resolve(false);
            else if (answer.toLowerCase() == "n") resolve(true);
            else resolve(promptForFreshKey());
        });
    });
}

async function getSecretKey(): Promise<string> {
    if (!fs.existsSync(SECRET_PATH)) {
        return await getFreshKey();
    } else {
        const localKey = fs.readFileSync(SECRET_PATH, "utf-8").trim();

        if (!localKey) return await getFreshKey();
        return localKey;
    }
}

function getFreshKey() {
    gotFresh = true;
    return new Promise<string>(async (resolve, reject) => {
        try {
            const zalo = new Zalo({
                selfListen: true,
                logging: true,
            });

            console.log();
            const api = await zalo.login(credentials);
            fs.writeFileSync(SECRET_PATH, api.getContext().secretKey, "utf-8");

            resolve(api.getContext().secretKey);
        } catch (error) {
            reject(error);
        }
    });
}

async function promptForCipherKey() {
    return new Promise<string>((resolve) => {
        rl.question("\nSao chép khóa và dán vào đây: ", (answer) => {
            if (answer.length == 0) resolve(promptForCipherKey());

            resolve(answer);
        });
    });
}
