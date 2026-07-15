/**
 * CryptoLogin Client SDK
 * Zero-storage authentication system
 * Copyright (c) 2026 erabytse
 * Licensed under the MIT License
 * @author erabytse
 * @version 1.2.4
 * @license MIT
 * 
 * Principal Client
 * Handles authentication with the server
 */

import { deriveUserId, isValidUserId, computeHmac } from './crypto.js';
import { NetworkError, AuthenticationError, ConfigurationError } from './errors.js';

/**
 * Client CryptoLogin
 * @example
 * import { createClient } from 'cryptologin-client';
 * const client = createClient({ baseURL: 'https://api.docudeeper.com/api/v1' });
 * const userId = await client.register(masterSecret, { name: 'John' });
 */
export class CryptoLoginClient {
    /**
     * @param {Object} options
     * @param {string} options.baseURL - Base URL of the API
     * @param {number} [options.timeout=10000] - Request timeout in ms
     * @param {Function} [options.onError] - Error callback (optional)
     */
    constructor(options = {}) {
        if (!options.baseURL) {
            throw new ConfigurationError('baseURL is required');
        }
        this.baseURL = options.baseURL.replace(/\/+$/, '');
        this.timeout = options.timeout || 10000;
        this.onError = options.onError || null;
        
        // Session status
        this._sessionId = null;
        this._userId = null;
        this._expiresAt = null;
    }

    /**
     * Check whether the user is logged in
     * @returns {boolean}
     */
    get isAuthenticated() {
        return this._sessionId !== null && this._expiresAt !== null && new Date() < this._expiresAt;
    }

    /**
     * Retrieves the session ID
     * @returns {string|null}
     */
    get sessionId() {
        return this._sessionId;
    }

    /**
     * Retrieves the user ID
     * @returns {string|null}
     */
    get userId() {
        return this._userId;
    }

    /**
     * Make an API request
     * @param {string} endpoint - Endpoint (ex: /auth/register)
     * @param {Object} options - Options fetch
     * @returns {Promise<Object>}
     */
    async _request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (this.isAuthenticated && this._sessionId) {
            headers['Authorization'] = `Bearer ${this._sessionId}`;
        }

        const config = {
            method: options.method || 'POST',
            headers,
            body: options.body ? JSON.stringify(options.body) : undefined,
            signal: AbortSignal.timeout ? AbortSignal.timeout(this.timeout) : undefined
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json().catch(() => ({})); // Prevent crash on non-JSON error responses

            if (!response.ok) {
                const errorMsg = data.detail || data.message || `HTTP ${response.status}`;
                
                // Use specific error classes for better DX (Developer Experience)
                const error = (response.status === 401 || response.status === 403)
                    ? new AuthenticationError(errorMsg)
                    : new NetworkError(errorMsg, response.status);
                    
                error.data = data; // Attach server response for debugging
                
                if (this.onError) {
                    this.onError(error);
                }
                throw error;
            }
            return data;
        } catch (error) {
            if (error.name === 'TimeoutError' || error.message.includes('timeout')) {
                const timeoutError = new NetworkError('Request timeout', 408);
                if (this.onError) this.onError(timeoutError);
                throw timeoutError;
            }
            // Re-throw if it's already our custom error, otherwise wrap it
            if (error instanceof NetworkError || error instanceof AuthenticationError) {
                throw error;
            }
            const networkError = new NetworkError(`Request failed: ${error.message}`);
            if (this.onError) this.onError(networkError);
            throw networkError;
        }
    }

    /**
     * Register a new user
     * @param {string} masterSecret - The Master Secret
     * @param {Object} [userData={}] - User data (optional)
     * @returns {Promise<string>} - user_id
     */
    async register(masterSecret, userData = {}) {
        const userId = await deriveUserId(masterSecret);
        
        const response = await this._request('/auth/register_v2', {
            method: 'POST',
            body: {
                user_id: userId,
                user_data: userData
            }
        });
        
        if (!response.success && !response.data?.user_id) {
            throw new AuthenticationError(response.message || 'Registration failed');
        }
        
        this._userId = userId;
        return userId;
    }

    /**
     * Log in a user (V2 - Zero-Knowledge with HMAC)
     * @param {string} masterSecret - The Master Secret
     * @returns {Promise<Object>} - Session
     */
    async login(masterSecret) {
        const userId = await deriveUserId(masterSecret);
        this._userId = userId;

        const initResponse = await this._request('/auth/login/init_v2', {
            method: 'POST',
            body: { user_id: userId }
        });
        
        if (!initResponse.challenge) {
            throw new AuthenticationError('No challenge received from server');
        }
        
        const challenge = initResponse.challenge;
        console.log(`🔑 Challenge received: ${challenge.substring(0, 32)}...`);
        
        console.log('🔐 Computing HMAC locally...');
        const hmacSignature = await computeHmac(userId, challenge);
        console.log(`✅ HMAC computed: ${hmacSignature.substring(0, 32)}...`);

        const verifyResponse = await this._request('/auth/login/verify_v2', {
            method: 'POST',
            body: {
                user_id: userId,
                challenge_response: hmacSignature
            }
        });
        
        if (!verifyResponse.session_id) {
            throw new AuthenticationError(verifyResponse.message || 'Authentication failed');
        }

        this._sessionId = verifyResponse.session_id;
        this._expiresAt = verifyResponse.expires_at ? new Date(verifyResponse.expires_at) : null;
        
        return {
            sessionId: verifyResponse.session_id,
            userId: verifyResponse.user_id,
            expiresAt: verifyResponse.expires_at,
            authenticated: verifyResponse.authenticated !== false
        };
    }

    /**
     * Log the user out
     * @returns {Promise<void>}
     */
    async logout() {
        if (!this.isAuthenticated) {
            return;
        }
        try {
            await this._request('/auth/logout', {
                method: 'POST',
                body: { user_id: this._userId }
            });
        } catch (error) {
            console.warn('Logout error (ignored, session may already be expired):', error.message);
        }
        
        this._sessionId = null;
        this._expiresAt = null;
    }
}

/**
 * Helper function for creating a client instance
 * @param {Object} options - Client options
 * @returns {CryptoLoginClient}
 */
export function createClient(options) {
    return new CryptoLoginClient(options);
}