import { Zalo, LoginQRCallbackEventType, ThreadType } from "../src/index.js";
import fs from "node:fs";

/**
 * ==============================================================================
 * ZCA-JS: HƯỚNG DẪN ĐỒNG BỘ TIN NHẮN TỪ ĐIỆN THOẠI (CROSS-DEVICE TRANSFER SYNC)
 * ==============================================================================
 */

// ==============================================================================
// 🟢 TRƯỜNG HỢP 1: TỰ ĐỘNG ĐỒNG BỘ KHI ĐĂNG NHẬP QR (AUTO-SYNC ON LOGIN)
// ==============================================================================
export async function exampleCase1_AutoSyncOnLogin() {
    console.log("=== TRƯỜNG HỢP 1: TỰ ĐỘNG ĐỒNG BỘ KHI ĐĂNG NHẬP QR ===");

    const zalo = new Zalo({
        selfListen: true,
        logging: true,
    });

    const api = await zalo.loginQR(
        { qrPath: "./qr.png" },
        (event) => {
            if (event.type === LoginQRCallbackEventType.QRCodeGenerated) {
                console.log("👉 Mở app Zalo trên điện thoại quét mã QR trong file qr.png.");
                console.log("👉 Tích chọn 'Đồng bộ tin nhắn' trước khi bấm Xác nhận!");
            }
            if (event.type === LoginQRCallbackEventType.GotLoginInfo) {
                fs.writeFileSync("./credentials.json", JSON.stringify(event.data, null, 2));
            }
        }
    );

    // Lắng nghe các tin nhắn lịch sử được đồng bộ từ điện thoại sang
    api.listener.on("old_messages", (messages, type) => {
        console.log(`📥 [ĐÃ ĐỒNG BỘ] Nhận ${messages.length} tin nhắn lịch sử (${type === ThreadType.User ? "Cá nhân" : "Nhóm"}):`);
        for (const msg of messages) {
            const sender = msg.data.dName || msg.data.uidFrom;
            const content = typeof msg.data.content === "string" ? msg.data.content : JSON.stringify(msg.data.content);
            console.log(`   * [${msg.data.msgId}] ${sender}: ${content}`);
        }
    });

    // Lắng nghe tin nhắn mới thời gian thực
    api.listener.on("message", (msg) => {
        const sender = msg.data.dName || msg.data.uidFrom;
        console.log(`💬 [Tin nhắn mới]: ${sender}: ${msg.data.content}`);
    });

    // Khởi động WebSocket Listener để nhận dữ liệu đồng bộ
    api.listener.start();

    // Nạp danh bạ bạn bè và nhóm
    const allFriends = await api.getAllFriends();
    const allGroups = await api.getAllGroups();
    console.log(`✅ Đã nạp ${allFriends.length} bạn bè và ${Object.keys(allGroups.gridVerMap).length} nhóm!`);
}

// ==============================================================================
// 🔵 TRƯỜNG HỢP 2: KÍCH HOẠT ĐỒNG BỘ THỦ CÔNG TỪ XA (MANUAL TRIGGER SYNC)
// ==============================================================================
export async function exampleCase2_ManualTriggerSync() {
    console.log("\n=== TRƯỜNG HỢP 2: KÍCH HOẠT ĐỒNG BỘ THỦ CÔNG TỪ XA ===");

    if (!fs.existsSync("./credentials.json")) {
        console.error("Vui lòng đăng nhập và lưu file credentials.json trước!");
        return;
    }

    const creds = JSON.parse(fs.readFileSync("./credentials.json", "utf-8"));
    const zalo = new Zalo({ selfListen: true, logging: true });
    const api = await zalo.login(creds);

    // 1. Đăng ký nhận tin nhắn lịch sử từ luồng đồng bộ
    api.listener.on("old_messages", (messages, type) => {
        console.log(`📥 [ĐÃ ĐỒNG BỘ] Nhận ${messages.length} tin nhắn lịch sử (${type === ThreadType.User ? "Cá nhân" : "Nhóm"}):`);
        for (const msg of messages) {
            const sender = msg.data.dName || msg.data.uidFrom;
            const content = typeof msg.data.content === "string" ? msg.data.content : JSON.stringify(msg.data.content);
            console.log(`   * [${msg.data.msgId}] ${sender}: ${content}`);
        }
    });

    // 2. Khi WebSocket kết nối thành công, phát lệnh yêu cầu Mobile đồng bộ
    api.listener.on("connected", async () => {
        console.log("🟢 WebSocket đã kết nối!");
        console.log("📡 Đang gửi tín hiệu yêu cầu đồng bộ sang điện thoại...");
        
        // Gọi API yêu cầu đồng bộ sang mobile
        await api.requestSyncFromPhone();
        
        console.log("👉 Đã phát lệnh thành công! Bạn hãy mở app Zalo trên điện thoại và bấm 'Đồng bộ ngay'!");
    });

    // Khởi động WebSocket Listener
    api.listener.start();
}
