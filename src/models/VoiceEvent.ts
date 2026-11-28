export enum VoiceEventType {
    CONVERT_FINISH,
    UNKNOWN,
}

export type TVoiceEvent = {
    url: string;
    text: string;
    req_id: string;
    err: number;
    has_more: number;
};

export type VoiceEvent =
    | {
          type: VoiceEventType.CONVERT_FINISH;
          data: TVoiceEvent;
      }
    | {
          type: VoiceEventType.UNKNOWN;
          data: string;
      };

export function initializeVoiceEvent(data: TVoiceEvent, type: VoiceEventType): VoiceEvent {
    if (type == VoiceEventType.CONVERT_FINISH) {
        return {
            type,
            data,
        };
    }

    return {
        type: VoiceEventType.UNKNOWN,
        data: JSON.stringify(data),
    };
}
