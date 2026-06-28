// Implement JS logic for client.js
/**
 * CryptoLogin Client SDK
 * Zero-storage authentication system
 * Copyright (c) 2026 erabytse
 * Licensed under the MIT License
 * 
 * @author erabytse
 * @version 1.0.0
 * @license MIT
 * 
 * CryptoLogin Client SDK – Principal Client
 * Handles authentication with the server
*/


import { deriveUserId, isValidUserId, decryptChallenge  } from './crypto.js';

/**
 * Client CryptoLogin
 * 
 * @example
 * ```javascript
 * import { CryptoLoginClient } from 'cryptologin-client';
 * 
 * const client = new CryptoLoginClient({
 *     baseURL: 'https://api.docudeeper.com/api/v1'
 * });
 * 
 * // Enregistrement
 * const userId = await client.register(masterSecret, { name: 'John' });
 * 
 * // Login
 * const session = await client.login(masterSecret);
 * ```
 */
export class CryptoLoginClient {
    /**
     * @param {Object} options
     * @param {string} options.baseURL - Base URL of the API (ex: https://api.docudeeper.com/api/v1)
     * @param {number} options.timeout - Request timeout in ms (default: 10000)
     * @param {Function} options.onError - Error callback (optional)
     */
    constructor(options = {}) {
        if (!options.baseURL) {
            throw new Error('baseURL is required');
        }
        
        this.baseURL = options.baseURL.replace(/\/+$/, '');
        this.timeout = options.timeout || 10000;
        this.onError = options.onError || null;
        
        // Status of the session
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

        // Add the authentication token, if available
        if (this.isAuthenticated && this._sessionId) {
            headers['Authorization'] = `Bearer ${this._sessionId}`;
        }

        const config = {
            method: options.method || 'POST',
            headers,
            body: options.body ? JSON.stringify(options.body) : undefined,
            signal: AbortSignal.timeout(this.timeout)
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                const error = new Error(data.detail || data.message || `HTTP ${response.status}`);
                error.status = response.status;
                error.data = data;
                
                if (this.onError) {
                    this.onError(error);
                }
                
                throw error;
            }
            
            return data;
        } catch (error) {
            if (error.name === 'TimeoutError') {
                const timeoutError = new Error('Request timeout');
                timeoutError.status = 408;
                throw timeoutError;
            }
            throw error;
        }
    }

    /**
     * Register a new user
     * 
     * @param {string} masterSecret - The Master Secret
     * @param {Object} userData - User data (optional)
     * @returns {Promise<string>} - user_id
     */
    async register(masterSecret, userData = {}) {
        // 1. Deriving user_id (client-side)
        const userId = await deriveUserId(masterSecret);
        
        // 2. Submit the registration request
        const response = await this._request('/auth/register_v2', {
            method: 'POST',
            body: {
                user_id: userId,
                user_data: userData
            }
        });
        
        if (!response.success && !response.data?.user_id) {
            throw new Error(response.message || 'Registration failed');
        }
        
        this._userId = userId;
        return userId;
    }

    /**
     * Log in a user
     * 
     * @param {string} masterSecret - The Master Secret
     * @returns {Promise<Object>} - Session
     */
    async login(masterSecret) {
        // 1. Deriving user_id (client-side)
        const userId = await deriveUserId(masterSecret);
        this._userId = userId;
        
        // 2. Initiate the login – obtain the encrypted challenge
        const initResponse = await this._request('/auth/login/init_v2', {
            method: 'POST',
            body: { user_id: userId }
        });
        
        if (!initResponse.challenge) {
            throw new Error('No challenge received from server');
        }
        
        const encryptedChallenge = initResponse.challenge;
        
        // 3. DECRYPT the challenge locally with master_secret (CRITICAL!)
        console.log('🔓 Decrypting challenge locally...');
        const decryptedChallenge = await decryptChallenge(encryptedChallenge, masterSecret);

        // 4. Verify the login – send the DECRYPTED plaintext
        const verifyResponse = await this._request('/auth/login/verify_v2', {
            method: 'POST',
            body: {
                user_id: userId,
                challenge_response: decryptedChallenge  
            }
        });
        
        if (!verifyResponse.session_id) {
            throw new Error(verifyResponse.message || 'Authentication failed');
        }
        
        // 4. Save the session
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
     * 
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
            // Ignore logout errors (the session may already have expired)
            console.warn('Logout error (ignored):', error.message);
        }
        
        // Reset the local status
        this._sessionId = null;
        this._expiresAt = null;
    }
}

/**
 * Help function for creating a client instance
 * 
 * @param {Object} options - Client options
 * @returns {CryptoLoginClient}
 */
export function createClient(options) {
    return new CryptoLoginClient(options);
}