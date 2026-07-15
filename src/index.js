/**
 * CryptoLogin Client SDK
 * Zero-storage authentication system
 * Copyright (c) 2026 erabytse
 * Licensed under the MIT License
 * @author erabytse
 * @version 1.2.4
 * @license MIT
 */

// Core imports (adjust paths if your folder structure differs)
import { CryptoLoginClient, createClient } from './core/client.js';
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

// Re-export everything for tree-shaking and named imports
export {
    CryptoLoginClient,
    createClient,
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
export const VERSION = '1.2.4';

// Default export for backward compatibility
export default {
    CryptoLoginClient,
    createClient,
    deriveUserId,
    computeHmac,
    isValidUserId,
    generateChallenge,
    saveSession,
    loadSession,
    clearSession,
    VERSION
};