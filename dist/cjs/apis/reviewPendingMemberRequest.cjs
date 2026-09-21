'use strict';

var ZaloApiError = require('../Errors/ZaloApiError.cjs');
var utils = require('../utils.cjs');

exports.ReviewPendingMemberRequestStatus = void 0;
(function (ReviewPendingMemberRequestStatus) {
    ReviewPendingMemberRequestStatus[ReviewPendingMemberRequestStatus["SUCCESS"] = 0] = "SUCCESS";
    ReviewPendingMemberRequestStatus[ReviewPendingMemberRequestStatus["NOT_IN_PENDING_LIST"] = 170] = "NOT_IN_PENDING_LIST";
    ReviewPendingMemberRequestStatus[ReviewPendingMemberRequestStatus["ALREADY_IN_GROUP"] = 178] = "ALREADY_IN_GROUP";
    ReviewPendingMemberRequestStatus[ReviewPendingMemberRequestStatus["INSUFFICIENT_PERMISSION"] = 166] = "INSUFFICIENT_PERMISSION";
})(exports.ReviewPendingMemberRequestStatus || (exports.ReviewPendingMemberRequestStatus = {}));
const reviewPendingMemberRequestFactory = utils.apiFactory()((api, _, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.group[0]}/api/group/pending-mems/review`);
    /**
     * Review pending member(s) request
     *
     * @param payload - The payload containing data to review the pending member(s) request
     * @param groupId - The id of the group to review the pending member(s) request
     *
     * @note Only the group leader and deputy group leader can review
     *
     * @throws {ZaloApiError}
     */
    return async function reviewPendingMemberRequest(payload, groupId) {
        if (!Array.isArray(payload.members))
            payload.members = [payload.members];
        const params = {
            grid: groupId,
            members: payload.members,
            isApprove: payload.isApprove ? 1 : 0, // 1: approve, 0: reject
        };
        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams)
            throw new ZaloApiError.ZaloApiError("Failed to encrypt params");
        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
            method: "GET",
        });
        return utils.resolve(response);
    };
});

exports.reviewPendingMemberRequestFactory = reviewPendingMemberRequestFactory;
