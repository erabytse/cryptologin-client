/**
 * CryptoLogin Client SDK
 * Zero-storage authentication system
 * Copyright (c) 2026 erabytse
 * Licensed under the MIT License
 * @author erabytse
 * @version 1.2.5
 * @license MIT
 */

// Core imports
import { CryptoLoginClient } from './core/client.js';
import { deriveUserId, computeHmac, isValidUserId, generateChallenge } from './core/crypto.js';
import { saveSession, loadSession, clearSession } from './utils/helpers.js'; 
import {
    CryptoLoginError,
    AuthenticationError,
    NetworkError,
    DecryptionError,
    ConfigurationError,
    SessionExpiredError
} from './core/errors.js';

// Re-export tout (Named exports uniquement, c'est le standard moderne)
export {
    CryptoLoginClient,
    deriveUserId,
    computeHmac,
    isValidUserId,
    generateChallenge,
    saveSession,
    loadSession,
    clearSession,
    CryptoLoginError,
    AuthenticationError,
    NetworkError,
    DecryptionError,
    ConfigurationError,
    SessionExpiredError
};

// Version
export const VERSION = '1.2.5';

/**
 * Quick initialization helper
 * @param {Object} config - Configuration object
 * @param {string} config.baseURL - API base URL
 * @param {number} [config.timeout=10000] - Request timeout in ms
 * @returns {CryptoLoginClient}
 */
export function createClient(config) {
    if (!config || !config.baseURL) {
        throw new ConfigurationError('baseURL is required');
    }
    return new CryptoLoginClient(config);
}