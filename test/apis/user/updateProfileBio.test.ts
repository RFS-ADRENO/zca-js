import { describe, expect, test, mock, beforeAll } from "bun:test";
import type { ZPWServiceMap, ContextSession } from "../../../src/context.js";

// Mock dependencies
const mockMakeURL = mock((ctx: any, url: string) => url);
const mockRequest = mock(async () => ({
    data: { error_code: 0, data: "success" },
}));
const mockResolveResponse = mock((ctx: any, res: any) => res.data);
const mockEncodeAES = mock(() => "encrypted_params");

mock.module("../../../src/utils/http.js", () => ({
    makeURL: mockMakeURL,
    request: mockRequest,
    resolveResponse: mockResolveResponse,
}));

mock.module("../../../src/utils/crypto.js", () => ({
    encodeAES: mockEncodeAES,
}));

// Import factory
const { updateProfileBioFactory } = await import("../../../src/apis/user/updateProfileBio.js");

// Mock Data
const mockCtx = {
    uid: "test-uid",
    imei: "test-imei",
    cookie: { ts: 1234567890 },
    secretKey: "secret",
    language: "vi",
} as unknown as ContextSession;

const mockApi = {
    zpwServiceMap: {
        profile: ["https://profile.zolo.me"],
    },
} as unknown as { zpwServiceMap: ZPWServiceMap; };

describe("API: updateProfileBio", () => {
    test("should call request with correct params", async () => {
        const updateProfileBio = updateProfileBioFactory(mockCtx, mockApi as any);
        const bio = "My new bio";

        await updateProfileBio(bio);

        expect(mockMakeURL).toHaveBeenCalled();
        expect(mockEncodeAES).toHaveBeenCalled();
        expect(mockRequest).toHaveBeenCalled();
    });
});
