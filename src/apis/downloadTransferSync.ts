import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type DownloadTransferSyncOptions =
    | string
    | {
          key: string;
          exp: number | string;
          sig: string;
      };

export const downloadTransferSyncFactory = apiFactory<Buffer>()((api, ctx, utils) => {
    /**
     * Tải khối dữ liệu snapshot đồng bộ tin nhắn từ máy chủ transfersync.zaloapp.com
     *
     * @param options URL đầy đủ hoặc object chứa { key, exp, sig }
     * @throws {ZaloApiError}
     */
    return async function downloadTransferSync(options: DownloadTransferSyncOptions): Promise<Buffer> {
        let downloadUrl = "";
        if (typeof options === "string") {
            downloadUrl = options;
        } else {
            if (!options.key || !options.exp || !options.sig) {
                throw new ZaloApiError("Missing key, exp or sig in options");
            }
            downloadUrl = `https://transfersync.zaloapp.com/api/transfer-sync-v2/download?key=${options.key}&exp=${options.exp}&sig=${options.sig}`;
        }

        const response = await utils.request(downloadUrl, {
            method: "GET",
        });

        if (!response.ok) {
            throw new ZaloApiError(`Failed to download transfer snapshot: ${response.statusText} (${response.status})`);
        }

        const arrayBuffer = await response.arrayBuffer();
        return Buffer.from(arrayBuffer);
    };
});
