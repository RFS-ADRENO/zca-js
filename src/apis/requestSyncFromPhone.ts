import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type RequestSyncFromPhoneResponse = {
    success: boolean;
};

export const requestSyncFromPhoneFactory = apiFactory<RequestSyncFromPhoneResponse>()((api, ctx) => {
    /**
     * Gửi tín hiệu kích hoạt yêu cầu đồng bộ tin nhắn từ xa sang app điện thoại (Trường hợp 2)
     *
     * @throws {ZaloApiError}
     */
    return async function requestSyncFromPhone(): Promise<RequestSyncFromPhoneResponse> {
        if (!api.listener) {
            throw new ZaloApiError("WebSocket listener is not initialized. Please call api.listener.start() first.");
        }

        // Gửi frame yêu cầu đồng bộ qua WebSocket
        const syncPayload = {
            version: 1,
            cmd: 510,
            subCmd: 0,
            data: {
                act: "sync_request",
                imei: ctx.imei,
                ts: Date.now(),
            },
        };

        api.listener.sendWs(syncPayload, true);
        return { success: true };
    };
});
