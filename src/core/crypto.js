// Implement JS logic for crypto.js
/**
 * CryptoLogin Client SDK – Cryptographic Operations
 * Uses the browser’s Web Crypto API
 */

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