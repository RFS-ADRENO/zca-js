import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { ThreadType } from "../models/index.js";
import { apiFactory } from "../utils.js";

export type SetMuteParams = {
    duration?: MuteDuration | number;
    action?: MuteAction;
};

export type SetMuteResponse = "";

export const enum MuteDuration {
    ONE_HOUR = 3600,
    FOUR_HOURS = 14400,
    FOREVER = -1,
    UNTIL_8AM = "until8AM",
}

export const enum MuteAction {
    MUTE = 1,
    UNMUTE = 3, // khi tat thi duration = -1
}

export const setMuteFactory = apiFactory<SetMuteResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.profile[0]}/api/social/profile/setmute`);

    /**
     * Set mute
     *
     * @param params - Mute parameters
     * @param threadID - ID of the thread to mute
     * @param type - Type of thread (User or Group)
     *
     * @throws ZaloApiError
     */
    return async function setMute(params: SetMuteParams = {}, threadID: string, type: ThreadType = ThreadType.User) {
        const { duration = MuteDuration.FOREVER, action = MuteAction.MUTE } = params;
        let muteDuration: number;

        if (action === MuteAction.UNMUTE) {
            muteDuration = -1;
        } else if (duration === MuteDuration.FOREVER) {
            muteDuration = -1;
        } else if (duration === MuteDuration.UNTIL_8AM) {
            const now = new Date();
            const next8AM = new Date(now);
            next8AM.setHours(8, 0, 0, 0);

            if (now.getHours() >= 8) {
                next8AM.setDate(next8AM.getDate() + 1);
            }

            muteDuration = Math.floor((next8AM.getTime() - now.getTime()) / 1000);
        } else {
            muteDuration = duration;
        }

        const requestParams = {
            toid: threadID,
            duration: muteDuration,
            action: action,
            startTime: Math.floor(Date.now() / 1000),
            muteType: type === ThreadType.User ? 1 : 2,
            imei: ctx.imei,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(requestParams));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(serviceURL, {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });

        return utils.resolve(response);
    };
});
