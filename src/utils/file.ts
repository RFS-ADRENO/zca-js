import fs from "node:fs";
import path from "node:path";
import SparkMD5 from "spark-md5";
import type { AttachmentSource } from "../models/Attachment.js";
import { type ContextBase } from "../context.js";
import { ZaloApiError, ZaloApiMissingImageMetadataGetter } from "../Errors/index.js";

export async function getImageMetaData(ctx: ContextBase, filePath: string) {
    if (!ctx.options.imageMetadataGetter) {
        throw new ZaloApiMissingImageMetadataGetter();
    }

    const imageData = await ctx.options.imageMetadataGetter(filePath);
    if (!imageData) {
        throw new ZaloApiError("Failed to get image metadata");
    }

    const fileName = filePath.split("/").pop()!;

    return {
        fileName,
        totalSize: imageData.size,
        width: imageData.width,
        height: imageData.height,
    };
}

export async function getFileSize(filePath: string) {
    return fs.promises.stat(filePath).then((s) => s.size);
}

export async function getGifMetaData(ctx: ContextBase, filePath: string) {
    if (!ctx.options.imageMetadataGetter) {
        throw new ZaloApiMissingImageMetadataGetter();
    }

    const gifData = await ctx.options.imageMetadataGetter(filePath);
    if (!gifData) {
        throw new ZaloApiError("Failed to get gif metadata");
    }

    const fileName = path.basename(filePath);

    return {
        fileName,
        totalSize: gifData.size,
        width: gifData.width,
        height: gifData.height,
    };
}

export async function getMd5LargeFileObject(source: AttachmentSource, fileSize: number) {
    const buffer = typeof source == "string" ? await fs.promises.readFile(source) : source.data;
    return new Promise<{
        currentChunk: number;
        data: string;
    }>((resolve) => {
        let currentChunk = 0;
        const chunkSize = 2097152, // Read in chunks of 2MB
            chunks = Math.ceil(fileSize / chunkSize),
            spark = new SparkMD5.ArrayBuffer();

        function loadNext() {
            const start = currentChunk * chunkSize,
                end = start + chunkSize >= fileSize ? fileSize : start + chunkSize;

            spark.append(new Uint8Array(buffer.subarray(start, end)).buffer as ArrayBuffer);
            currentChunk++;

            if (currentChunk < chunks) {
                loadNext();
            } else {
                resolve({
                    currentChunk,
                    data: spark.end(),
                });
            }
        }

        loadNext();
    });
}

export function getFileExtension(e: string) {
    return path.extname(e).slice(1);
}

export function getFileName(e: string) {
    return path.basename(e);
}
