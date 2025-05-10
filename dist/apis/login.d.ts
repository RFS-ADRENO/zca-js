import type { ContextBase } from "../context.js";
export declare function login(ctx: ContextBase, encryptParams: boolean): Promise<Record<string, any> | null>;
export declare function getServerInfo(ctx: ContextBase, encryptParams: boolean): Promise<any>;
