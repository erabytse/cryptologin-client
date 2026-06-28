/**
 * CryptoLogin Client SDK
 * Zero-storage authentication system
 * Copyright (c) 2026 erabytse
 * Licensed under the MIT License
 * @author erabytse
 * @version 1.2.3
 * @license MIT
 */

// Import pour pouvoir les réutiliser dans export default
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

// Re-export tout
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
export const VERSION = '1.2.3';

/**
 * Quick initialization helper
 * @param {Object} config - Configuration object
 * @param {string} config.baseURL - API base URL
 * @param {number} [config.timeout=10000] - Request timeout in ms
 * @returns {CryptoLoginClient}
 */
export function createClient(config) {
  if (!config || !config.baseURL) {
    throw new Error('baseURL is required');
  }
  return new CryptoLoginClient(config);
}

// Default export
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