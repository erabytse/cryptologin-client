/**
 * CryptoLogin Client SDK
 * Zero-storage authentication system
 * Copyright (c) 2026 erabytse
 * Licensed under the MIT License
 * @author erabytse
 * @version 1.2.1
 * @license MIT
 */

// ✅ IMPORT local (pas juste re-export) pour pouvoir utiliser dans createClient
import { CryptoLoginClient } from './core/client.js';

// Re-exports pour les consommateurs du SDK
export { CryptoLoginClient } from './core/client.js';
export { deriveUserId, decryptChallenge, isValidUserId, generateChallenge } from './core/crypto.js';

// Utility exports (seulement ce qui existe dans helpers.js)
export {
  saveSession,
  loadSession,
  clearSession
} from './utils/helpers.js';

// Error exports
export {
  CryptoLoginError,
  AuthenticationError,
  NetworkError,
  DecryptionError,
  ConfigurationError,
  SessionExpiredError
} from './core/errors.js';

// Version
export const VERSION = '1.2.1';

/**
 * Quick initialization helper
 * @param {Object} config
 * @param {string} config.baseURL - API base URL
 * @param {number} [config.timeout=10000] - Request timeout in ms
 * @returns {CryptoLoginClient}
 */
export function createClient(config) {
  if (!config || !config.baseURL) {
    throw new Error('baseURL is required');
  }
  // ✅ Passer l'objet config directement (le constructeur attend un objet)
  return new CryptoLoginClient(config);
}

// Default export
export default {
  CryptoLoginClient,
  createClient,
  VERSION
};