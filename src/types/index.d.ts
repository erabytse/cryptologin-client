/**
 * CryptoLogin Client SDK - TypeScript Definitions
 */

export interface CryptoLoginClientOptions {
    baseURL: string;
    timeout?: number;
    onError?: (error: Error) => void;
}

export interface Session {
    sessionId: string;
    userId: string;
    expiresAt: string;
    authenticated: boolean;
}

export interface RegisterResponse {
    success: boolean;
    data?: {
        user_id: string;
    };
    message?: string;
}

export interface LoginInitResponse {
    challenge: string;
    message: string;
}

export interface LoginVerifyResponse {
    authenticated: boolean;
    session_id: string;
    user_id: string;
    expires_at: string;
}

export class CryptoLoginClient {
    constructor(options: CryptoLoginClientOptions);
    
    get isAuthenticated(): boolean;
    get sessionId(): string | null;
    get userId(): string | null;
    
    register(masterSecret: string, userData?: Record<string, any>): Promise<string>;
    login(masterSecret: string): Promise<Session>;
    logout(): Promise<void>;
}

export function createClient(options: CryptoLoginClientOptions): CryptoLoginClient;

export function deriveUserId(masterSecret: string): Promise<string>;
export function isValidUserId(userId: string): boolean;
export function generateChallenge(length?: number): string;

export function saveSession(session: Session, key?: string): void;
export function loadSession(key?: string): Session | null;
export function clearSession(key?: string): void;
export function isWebCryptoSupported(): boolean;
export function generateId(): string;

export const VERSION: string;