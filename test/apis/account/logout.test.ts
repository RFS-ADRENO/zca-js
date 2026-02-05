import { describe, expect, test, mock } from "bun:test";
import type { ContextSession } from "../../../src/context.js";
import type { API } from "../../../src/apis.js";

// Mock dependencies
const mockMakeURL = mock((ctx: unknown, url: string) => url);
const mockRequest = mock(async () => ({
    data: { error_code: 0, data: "success" },
}));
const mockResolveResponse = mock((ctx: unknown, res: unknown) => (res as { data: unknown }).data);
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
const { logoutFactory } = await import("../../../src/apis/account/logout.js");

// Mock Data
const mockCtx = {
    uid: "test-uid",
    imei: "test-imei",
    cookie: { ts: 1234567890 },
    secretKey: "secret",
} as unknown as ContextSession;

const mockApi = {
    zpwServiceMap: {
        login: ["https://login.zolo.me"],
    },
} as unknown as API;

describe("API: logout", () => {
    test("should call request to logout endpoint", async () => {
        const logout = logoutFactory(mockCtx, mockApi);

        await logout();

        expect(mockMakeURL).toHaveBeenCalled();
        expect(mockEncodeAES).toHaveBeenCalled();
        expect(mockRequest).toHaveBeenCalled();
    });
});
