import { Zalo } from "../src";
import { generateRSAKeyPair } from "../src/utils";
import { SyncEventType } from "../src/models/SyncEvent";

const zalo = new Zalo();
const api = await zalo.loginQR();

api.listener.on("sync_event", async (event) => {
    if (event.type == SyncEventType.SYNCMSG_INFO) {
        console.log("Sync data received you can downloaded the file and decrypte the encrypted key", event);

        const result = await api.getSyncData({
            url: event.data.url,
            encrypted_key: event.data.encrypted_key,
            file_name: event.data.file_name,
            file_size: event.data.file_size,
            checksum_code: event.data.checksum_code,
            from_seq_id: event.data.from_seq_id,
            is_full_transfer: event.data.is_full_transfer,
            savePath: "./sync_data",
        });

        if (result.success && result.data) {
            console.log("File saved to:", result.data.file_path);
            console.log("Encrypted key:", result.data.encrypted_key);
        }
    }
    // TODO handle the decryption of the encrypted key and download the file
    // Note that the encrypted key can be decrypted using the private key generated from generateRSAKeyPair function I include the decryptWithPrivateKey function
});
const { publicKeyBase64 } = generateRSAKeyPair();
api.pullMobile({
    public_key: publicKeyBase64,
});
api.listener.start();
