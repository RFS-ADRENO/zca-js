import zlib from "node:zlib";
import { ZaloApiError } from "../Errors/ZaloApiError.js";

type ZstdDecompressSync = (data: Uint8Array) => Uint8Array;

/**
 * Sync payloads are zstd compressed. `node:zlib` supports zstd from Node.js 22.15 / 23.8 (and in Bun),
 * older runtimes need the optional `fzstd` package.
 */
export async function zstdDecompress(data: Uint8Array): Promise<Uint8Array> {
    const native = (zlib as unknown as { zstdDecompressSync?: ZstdDecompressSync }).zstdDecompressSync;
    if (typeof native === "function") return native(data);

    try {
        const moduleName = "fzstd";
        const fzstd = (await import(moduleName)) as { decompress: ZstdDecompressSync };
        return fzstd.decompress(data);
    } catch {
        throw new ZaloApiError(
            "This runtime cannot decompress zstd data. Use Node.js >= 22.15 or install the `fzstd` package.",
        );
    }
}
