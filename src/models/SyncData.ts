export type SyncData = {
    file_path: string;
    encrypted_key: string;
    metadata: {
        file_name: string;
        file_size: number;
        checksum_code: string;
        from_seq_id: number;
        is_full_transfer: number;
    };
};

export type SyncDataStream = {
    stream: ReadableStream<Uint8Array> | null;
    metadata: {
        file_name: string;
        file_size: number;
        checksum_code: string;
        from_seq_id: number;
        is_full_transfer: number;
        encrypted_key: string;
    };
    response?: {
        status: number;
        statusText: string;
        url: string;
        contentType: string | null;
        contentLength: string | null;
    };
};

export type SyncDataResponse = {
    success: boolean;
    data?: SyncData;
    stream?: SyncDataStream;
    error?: string;
};
