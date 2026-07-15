/**
 * CryptoLogin Client SDK
 * Zero-storage authentication system
 * Copyright (c) 2026 erabytse
 * Licensed under the MIT License
 * @author erabytse
 * @version 1.2.4
 * @license MIT
 * 
 * Cryptographic Operations
 * Uses the browser's Web Crypto API or Node.js crypto module fallback.
 * V2 Flow: HMAC-based Zero-Knowledge Authentication
 */

// Environment-agnostic crypto resolver
const getSubtleCrypto = () => {
    if (typeof globalThis !== 'undefined' && globalThis.crypto?.subtle) {
        return globalThis.crypto.subtle;
    }
    if (typeof require !== 'undefined') {
        try {
            return require('crypto').webcrypto.subtle;
        } catch (e) {
            throw new Error('Web Crypto API not available. Use Node.js 19+ or a secure browser context (HTTPS/localhost).');
        }
    }
    throw new Error('Web Crypto API not available in this environment.');
};

const getRandomValues = (array) => {
    if (typeof globalThis !== 'undefined' && globalThis.crypto?.getRandomValues) {
        return globalThis.crypto.getRandomValues(array);
    }
    if (typeof require !== 'undefined') {
        return require('crypto').webcrypto.getRandomValues(array);
    }
    throw new Error('Crypto.getRandomValues not available in this environment.');
};

const subtle = getSubtleCrypto();

/**
 * Derive a user_id from the master_secret
 * Uses PBKDF2-SHA512 with 100,000 iterations
 * @param {string} masterSecret - The master secret (minimum 32 characters)
 * @returns {Promise<string>} - user_id (64 hexadecimal characters)
 */
export async function deriveUserId(masterSecret) {
    if (!masterSecret || masterSecret.length < 32) {
        throw new Error('Master secret must be at least 32 characters');
    }
    
    const encoder = new TextEncoder();
    const secretData = encoder.encode(masterSecret);
    const salt = encoder.encode('cryptologin-v2-salt');
    
    try {
        const key = await subtle.importKey(
            'raw',
            secretData,
            { name: 'PBKDF2' },
            false,
            ['deriveBits']
        );
        
        const derivedBits = await subtle.deriveBits(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: 100000,
                hash: 'SHA-512'
            },
            key,
            256
        );
        
        const hashArray = Array.from(new Uint8Array(derivedBits));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (error) {
        throw new Error(`Failed to derive user_id: ${error.message}`);
    }
}

/**
 * Compute HMAC-SHA256 of a challenge using user_id as key
 * This is the cryptographic proof that the client knows the master_secret
 * @param {string} userId - The user_id (used as HMAC key)
 * @param {string} challenge - The challenge to sign
 * @returns {Promise<string>} - HMAC signature (64 hex characters)
 */
export async function computeHmac(userId, challenge) {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(userId);
    const messageData = encoder.encode(challenge);
    
    try {
        const key = await subtle.importKey(
            'raw',
            keyData,
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['sign']
        );
        
        const signature = await subtle.sign('HMAC', key, messageData);
        const hashArray = Array.from(new Uint8Array(signature));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (error) {
        throw new Error(`Failed to compute HMAC: ${error.message}`);
    }
}

/**
 * Checks whether a user_id is valid (64 hex characters)
 * @param {string} userId - The user_id to be validated
 * @returns {boolean}
 */
export function isValidUserId(userId) {
    return typeof userId === 'string' &&
           userId.length === 64 &&
           /^[0-9a-f]{64}$/i.test(userId);
}

/**
 * Generates a random challenge (for demonstration/testing purposes)
 * @param {number} length - Length in bytes
 * @returns {string} - Hexadecimal Challenge
 */
export function generateChallenge(length = 32) {
    const array = new Uint8Array(length);
    getRandomValues(array);
    return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
}