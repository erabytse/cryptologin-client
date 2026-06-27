// Implement JS logic for helpers.js
/**
 * CryptoLogin Client SDK - Utilities
 */

/**
 * Stores the session in localStorage
 * 
 * @param {Object} session - { sessionId, userId, expiresAt }
 * @param {string} key - Storage key (default: “cryptologin_session”)
 */
export function saveSession(session, key = 'cryptologin_session') {
    try {
        localStorage.setItem(key, JSON.stringify(session));
    } catch (error) {
        console.warn('Could not save session:', error);
    }
}

/**
 * Retrieves the session from localStorage
 * 
 * @param {string} key - Storage key (default: “cryptologin_session”)
 * @returns {Object|null}
 */
export function loadSession(key = 'cryptologin_session') {
    try {
        const data = localStorage.getItem(key);
        if (!data) return null;
        const session = JSON.parse(data);
        if (session.expiresAt && new Date(session.expiresAt) < new Date()) {
            // Session expirée
            clearSession(key);
            return null;
        }
        return session;
    } catch (error) {
        return null;
    }
}

/**
 * Deletes the localStorage session
 * 
 * @param {string} key - Storage key (default: “cryptologin_session”)
 */
export function clearSession(key = 'cryptologin_session') {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.warn('Could not clear session:', error);
    }
}

/**
 * Check whether the browser supports the Web Crypto API
 * 
 * @returns {boolean}
 */
export function isWebCryptoSupported() {
    return typeof crypto !== 'undefined' && 
           typeof crypto.subtle !== 'undefined' &&
           typeof crypto.subtle.importKey === 'function';
}

/**
 * Generates a unique identifier (for debugging)
 * 
 * @returns {string}
 */
export function generateId() {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
}