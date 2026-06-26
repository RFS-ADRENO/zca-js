export enum SyncEventType {
    USER_CONFIRM = "user_confirm",
    SYNCMSG_INFO = "syncmsg_info",
    TRANSFER_ERROR = "transfer_error",
    UNKNOWN = "unknown",
}

export type DatabaseBackupInfo = {
    backup_db: {
        msg_total: number;
        msg_thread: number;
    };
    db_format: number;
};

export type TSyncEventUserConfirm = {
    user_action: number;
    public_key: string;
    pc_name: string;
};

export type TSyncEventSyncMsgInfo = {
    uid: number;
    url: string;
    time: number;
    device_type: number;
    device_name: string;
    client_version: number;
    file_name: string;
    checksum_code: string;
    file_size: number;
    client_time: number;
    from_seq_id: number;
    public_key: string;
    encrypted_key: string;
    trigger_reason: number;
    is_full_transfer: number;
    db_info: string | DatabaseBackupInfo;
};

export type TSyncEventTransferError = {
    public_key: string;
    pc_name: string;
    can_retry: number;
    error_msg: string;
    error_code: number;
};

export type TSyncEvent = TSyncEventUserConfirm | TSyncEventSyncMsgInfo | TSyncEventTransferError;

export type SyncEvent =
    | {
          type: SyncEventType.USER_CONFIRM;
          data: TSyncEventUserConfirm;
          act: string;
          act_type: string;
      }
    | {
          type: SyncEventType.SYNCMSG_INFO;
          data: TSyncEventSyncMsgInfo;
          act: string;
          act_type: string;
      }
    | {
          type: SyncEventType.TRANSFER_ERROR;
          data: TSyncEventTransferError;
          act: string;
          act_type: string;
      }
    | {
          type: SyncEventType.UNKNOWN;
          data: unknown;
          act: string;
          act_type: string;
      };

export function initializeSyncEvent(data: TSyncEvent, act: string, act_type: string): SyncEvent {
    if (act === "user_confirm") {
        return {
            type: SyncEventType.USER_CONFIRM,
            data: data as TSyncEventUserConfirm,
            act,
            act_type,
        };
    } else if (act === "syncmsg_info") {
        return {
            type: SyncEventType.SYNCMSG_INFO,
            data: data as TSyncEventSyncMsgInfo,
            act,
            act_type,
        };
    } else if (act === "transfer_error") {
        return {
            type: SyncEventType.TRANSFER_ERROR,
            data: data as TSyncEventTransferError,
            act,
            act_type,
        };
    } else {
        return {
            type: SyncEventType.UNKNOWN,
            data,
            act,
            act_type,
        };
    }
}
