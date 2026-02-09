import { Zalo } from "../src";
import { SyncEventType } from "../src/models/SyncEvent";

const zalo = new Zalo();
const api = await zalo.loginQR();

api.listener.on("sync_event", (event) => {
    if (event.act == SyncEventType.SYNCMSG_INFO) {
        console.log("Sync data received you can downloaded the file and decrypte the encrypted key", event);
    }
    // TODO handle the decryption of the encrypted key and download the file
});
