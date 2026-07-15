/**
 * CryptoLogin Client SDK
 * Zero-storage authentication system
 * Copyright (c) 2026 erabytse
 * Licensed under the MIT License
 * @author erabytse
 * @version 1.2.4
 * @license MIT
 */

/**
 * Base error class for CryptoLogin
 */
export class CryptoLoginError extends Error {
    constructor(message, code = 'UNKNOWN_ERROR') {
        super(message);
        this.name = 'CryptoLoginError';
        this.code = code;
        this.timestamp = new Date().toISOString();
        this.isCryptoLoginError = true; // Flag for easy instanceof-like checking
    }
}

/**
 * Authentication failed error
 */
export class AuthenticationError extends CryptoLoginError {
    constructor(message = 'Authentication failed') {
        super(message, 'AUTH_FAILED');
        this.name = 'AuthenticationError';
    }
}

/**
 * Network request error
 */
export class NetworkError extends CryptoLoginError {
    constructor(message = 'Network request failed', statusCode = null) {
        super(message, 'NETWORK_ERROR');
        this.name = 'NetworkError';
        this.statusCode = statusCode;
    }
}

/**
 * Decryption error (wrong master_secret or corrupted data)
 */
export class DecryptionError extends CryptoLoginError {
    constructor(message = 'Failed to decrypt challenge') {
        super(message, 'DECRYPTION_FAILED');
        this.name = 'DecryptionError';
    }
}

/**
 * Invalid configuration error
 */
export class ConfigurationError extends CryptoLoginError {
    constructor(message = 'Invalid configuration') {
        super(message, 'INVALID_CONFIG');
        this.name = 'ConfigurationError';
    }
}

/**
 * Session expired error
 */
export class SessionExpiredError extends CryptoLoginError {
    constructor(message = 'Session has expired') {
        super(message, 'SESSION_EXPIRED');
        this.name = 'SessionExpiredError';
    }
}