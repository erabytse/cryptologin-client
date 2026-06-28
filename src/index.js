// Implement JS logic for index.js
/**
 * CryptoLogin Client SDK
 * Zero-storage authentication system
 * Copyright (c) 2026 erabytse
 * Licensed under the MIT License
 * 
 * @author erabytse
 * @version 1.0.0
 * @license MIT
*/


// Core exports
export { CryptoLoginClient } from './core/client.js';
export { deriveUserId, decryptChallenge } from './core/crypto.js';

// Utility exports
export { 
  saveSession, 
  loadSession, 
  clearSession, 
  isSessionValid 
} from './utils/helpers.js';

// Error exports
export { 
  CryptoLoginError,
  AuthenticationError,
  NetworkError,
  DecryptionError 
} from './core/errors.js';

// Version
export const VERSION = '1.0.0';

/**
 * Quick initialization helper
 * @param {Object} config - Configuration object
 * @param {string} config.baseUrl - API base URL
 * @param {number} [config.timeout=30000] - Request timeout in ms
 * @returns {CryptoLoginClient}
 */
export function createClient(config) {
  if (!config || !config.baseUrl) {
    throw new Error('baseUrl is required');
  }
  return new CryptoLoginClient(config.baseUrl, config.timeout);
}

// Default export for CommonJS compatibility
export default {
  CryptoLoginClient,
  createClient,
  deriveUserId,
  decryptChallenge,
  saveSession,
  loadSession,
  clearSession,
  isSessionValid,
  VERSION
};