import { apiFactory } from "../utils.js";
import { ZaloApiError } from "../Errors/ZaloApiError.js";
import type { SyncDataResponse, SyncData, SyncDataStream } from "../models/index.js";
import toughCookie from "tough-cookie";
import fs from "node:fs";
import path from "node:path";

export type GetSyncDataParams = {
    url: string;
    encrypted_key: string;
    file_name: string;
    file_size: number;
    checksum_code: string;
    from_seq_id: number;
    is_full_transfer: number;
    returnStream?: boolean;
    savePath?: string;
};

export const getSyncDataFactory = apiFactory<SyncDataResponse>()((api, ctx) => {
    /**
     * Downloads a file stream from a URL using fetch with proper authentication
     *
     * @param url The URL to download from
     * @returns Promise<Response> The full fetch Response object with body containing ReadableStream
     * @throws {ZaloApiError} If download fails
     */
    async function downloadFileStream(url: string): Promise<Response> {
        if (!ctx.cookie) ctx.cookie = new toughCookie.CookieJar();
        const cookie = ctx.cookie;

        const manualHeader = {
            "Cache-Control": "no-store, must-revalidate",
            Pragma: "no-cache",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            "User-Agent": ctx.userAgent || "",
            cookie: `${await cookie.getCookieString("https://chat.zalo.me/")}`,
            Expires: "0",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "no-cors",
            "Sec-Fetch-Site": "none",
            Connection: "keep-alive",
        };

        const response = await fetch(url, {
            method: "GET",
            headers: manualHeader,
        });

        if (!response.ok) {
            throw new ZaloApiError(`Failed to download file: HTTP ${response.status}`);
        }

        return response;
    }

    /**
     * Downloads a file from a URL using fetch with proper authentication
     * Converts the Response body (ReadableStream) to Buffer
     *
     * @param url The URL to download from
     * @returns Promise<Buffer> The downloaded file as a buffer
     * @throws {ZaloApiError} If download fails
     */
    async function downloadFile(url: string): Promise<Buffer> {
        const response = await downloadFileStream(url);

        if (!response.body) {
            throw new ZaloApiError("Response body is null");
        }

        // Convert ReadableStream to Buffer
        const reader = response.body.getReader();
        const chunks: Uint8Array[] = [];

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            chunks.push(value);
        }

        const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
        const result = new Uint8Array(totalLength);
        let offset = 0;

        for (const chunk of chunks) {
            result.set(chunk, offset);
            offset += chunk.length;
        }

        return Buffer.from(result);
    }

    /**
     * Download sync data from Zalo's mobile sync and save as encrypted .db.crypt file
     *
     * @param params GetSyncDataParams containing URL, encrypted key, and metadata
     *
     * @throws {ZaloApiError}
     *
     * @returns Promise<SyncDataResponse> The saved file path or stream
     */
    return async function getSyncData({
        url,
        encrypted_key,
        file_name,
        file_size,
        checksum_code,
        from_seq_id,
        is_full_transfer,
        returnStream = false,
        savePath = "./",
    }: GetSyncDataParams): Promise<SyncDataResponse> {
        try {
            if (returnStream) {
                const response = await downloadFileStream(url);

                const syncDataStream: SyncDataStream = {
                    stream: response.body,
                    metadata: {
                        file_name,
                        file_size,
                        checksum_code,
                        from_seq_id,
                        is_full_transfer,
                        encrypted_key,
                    },
                    response: {
                        status: response.status,
                        statusText: response.statusText,
                        url: response.url,
                        contentType: response.headers.get("content-type"),
                        contentLength: response.headers.get("content-length"),
                    },
                };

                return {
                    success: true,
                    stream: syncDataStream,
                };
            }

            const encryptedFileData = await downloadFile(url);

            const fileName = file_name.endsWith(".db.crypt") ? file_name : `${file_name}.db.crypt`;
            const fullPath = path.join(savePath, fileName);

            const dir = path.dirname(fullPath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            fs.writeFileSync(fullPath, encryptedFileData as unknown as Uint8Array);

            const syncData: SyncData = {
                file_path: fullPath,
                encrypted_key,
                metadata: {
                    file_name: fileName,
                    file_size,
                    checksum_code,
                    from_seq_id,
                    is_full_transfer,
                },
            };

            return {
                success: true,
                data: syncData,
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error occurred",
            };
        }
    };
});
