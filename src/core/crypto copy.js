// Implement JS logic for crypto.js
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
 * CryptoLogin Client SDK – Cryptographic Operations
 * Uses the browser’s Web Crypto API
 */

/**
 * Decrypt a challenge token using the master_secret
 * Handles Flash512 format: version.algo.salt.iv.ciphertext (dot-separated Base64)
 * Uses AES-256-GCM with PBKDF2-derived key
 *
 * IMPORTANT: The salt for PBKDF2 is extracted from the token itself (3rd part),
 * NOT a fixed string. This ensures client and server derive the same key.
 *
 * @param {string} encryptedChallenge - Flash512 formatted challenge
 * @param {string} masterSecret - The master secret
 * @returns {Promise<string>} - Decrypted plaintext challenge
 */
export async function decryptChallenge(encryptedChallenge, masterSecret) {
    const encoder = new TextEncoder();
    const secretData = encoder.encode(masterSecret);

    try {
        // 🔍 Parse the Flash512 format: version.algo.salt.iv.ciphertext
        const parts = encryptedChallenge.split('.');
        
        if (parts.length !== 5) {
            throw new Error(`Invalid challenge format: expected 5 parts, got ${parts.length}`);
        }

        const [versionB64, algoB64, saltB64, ivB64, ciphertextB64] = parts;

        // Decode version and algo for logging
        const version = atob(versionB64);
        const algo = atob(algoB64);
        console.log(`🔐 Challenge version: ${version}, algo: ${algo}`);

        // ✅ CRITICAL: Use the salt FROM THE TOKEN (not a fixed string)
        const salt = Uint8Array.from(atob(saltB64), c => c.charCodeAt(0));
        console.log(`🧂 Salt from token: ${salt.length} bytes`);

        // Decode IV (12 bytes for AES-GCM)
        const iv = Uint8Array.from(atob(ivB64), c => c.charCodeAt(0));
        if (iv.length !== 12) {
            throw new Error(`Invalid IV length: expected 12 bytes, got ${iv.length}`);
        }

        // Decode ciphertext
        const ciphertext = Uint8Array.from(atob(ciphertextB64), c => c.charCodeAt(0));

        console.log(`🔑 IV: ${iv.length} bytes, Ciphertext: ${ciphertext.length} bytes`);

        // Derive the decryption key using PBKDF2 with the SALT FROM THE TOKEN
        const key = await crypto.subtle.importKey(
            'raw',
            secretData,
            { name: 'PBKDF2' },
            false,
            ['deriveKey']
        );

        const derivedKey = await crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: salt,  // ✅ Salt from token, NOT a fixed string
                iterations: 100000,
                hash: 'SHA-512'
            },
            key,
            { name: 'AES-GCM', length: 256 },
            false,
            ['decrypt']
        );

        // Decrypt with AES-GCM
        const decrypted = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: iv },
            derivedKey,
            ciphertext
        );

        const plaintext = new TextDecoder().decode(decrypted);
        console.log(`✅ Challenge decrypted successfully`);
        return plaintext;

    } catch (error) {
        console.error('❌ Decryption error details:', error);
        throw new Error(`Failed to decrypt challenge: ${error.message}`);
    }
}

/**
 * Derive a user_id from the master_secret
 * Use PBKDF2-SHA512 with 100,000 iterations
 * 
 * @param {string} masterSecret - The secret master (minimum 32 characters)
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
        // Import the key for PBKDF2
        const key = await crypto.subtle.importKey(
            'raw',
            secretData,
            { name: 'PBKDF2' },
            false,
            ['deriveBits']
        );

        // Derive 256 bits (32 bytes)
        const derivedBits = await crypto.subtle.deriveBits(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: 100000,
                hash: 'SHA-512'
            },
            key,
            256
        );

        // Convert to hexadecimal
        const hashArray = Array.from(new Uint8Array(derivedBits));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (error) {
        throw new Error(`Failed to derive user_id: ${error.message}`);
    }
}

/**
 * Checks whether a user_id is valid (64 hex characters)
 * 
 * @param {string} userId - The user_id to be validated
 * @returns {boolean}
 */
export function isValidUserId(userId) {
    return typeof userId === 'string' && 
           userId.length === 64 && 
           /^[0-9a-f]{64}$/i.test(userId);
}

/**
 * Generates a random challenge (for demonstration purposes)
 * 
 * @param {number} length - Length in bytes
 * @returns {string} - Hexadecimal Challenge
 */
export function generateChallenge(length = 32) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
}