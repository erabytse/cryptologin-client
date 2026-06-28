import { describe, it, expect } from 'vitest';
import { deriveUserId, computeHmac, isValidUserId, generateChallenge } from '../src/core/crypto.js';

describe('CryptoLogin Client SDK', () => {
  
  describe('deriveUserId', () => {
    // Secrets de test d'au moins 32 caractères (contrainte du SDK)
    const VALID_SECRET_1 = 'my-super-secret-passphrase-1234567890'; // 40 chars
    const VALID_SECRET_2 = 'another-different-secret-0987654321';   // 40 chars

    it('should derive consistent user_id from master_secret', async () => {
      const userId1 = await deriveUserId(VALID_SECRET_1);
      const userId2 = await deriveUserId(VALID_SECRET_1);
      
      expect(userId1).toBe(userId2);
      expect(userId1).toHaveLength(64); // SHA-256 = 32 bytes = 64 hex chars
    });

    it('should produce different user_ids for different secrets', async () => {
      const userId1 = await deriveUserId(VALID_SECRET_1);
      const userId2 = await deriveUserId(VALID_SECRET_2);
      
      expect(userId1).not.toBe(userId2);
    });

    it('should throw error for empty secret', async () => {
      await expect(deriveUserId('')).rejects.toThrow();
    });

    it('should throw error for secret shorter than 32 characters', async () => {
      await expect(deriveUserId('too-short')).rejects.toThrow(
        'Master secret must be at least 32 characters'
      );
    });

    it('should accept secret of exactly 32 characters', async () => {
      const exactSecret = 'a'.repeat(32);
      const userId = await deriveUserId(exactSecret);
      expect(userId).toHaveLength(64);
    });
  });

  describe('computeHmac', () => {
    const VALID_SECRET = 'test-secret-for-hmac-computation-1234567890'; // 40 chars
    const CHALLENGE = 'a1b2c3d4e5f6789012345678901234567890123456789012345678901234abcd';

    it('should compute HMAC-SHA256 of a challenge', async () => {
      const userId = await deriveUserId(VALID_SECRET);
      const hmac = await computeHmac(userId, CHALLENGE);
      
      expect(hmac).toBeDefined();
      expect(hmac).toHaveLength(64); // SHA-256 = 32 bytes = 64 hex chars
      expect(/^[0-9a-f]{64}$/i.test(hmac)).toBe(true);
    });

    it('should produce consistent HMAC for same inputs', async () => {
      const userId = await deriveUserId(VALID_SECRET);
      const hmac1 = await computeHmac(userId, CHALLENGE);
      const hmac2 = await computeHmac(userId, CHALLENGE);
      
      expect(hmac1).toBe(hmac2);
    });

    it('should produce different HMAC for different challenges', async () => {
      const userId = await deriveUserId(VALID_SECRET);
      const challenge1 = 'a'.repeat(64);
      const challenge2 = 'b'.repeat(64);
      
      const hmac1 = await computeHmac(userId, challenge1);
      const hmac2 = await computeHmac(userId, challenge2);
      
      expect(hmac1).not.toBe(hmac2);
    });

    it('should produce different HMAC for different user_ids', async () => {
      const userId1 = await deriveUserId(VALID_SECRET);
      const userId2 = await deriveUserId('another-secret-for-testing-0987654321');
      
      const hmac1 = await computeHmac(userId1, CHALLENGE);
      const hmac2 = await computeHmac(userId2, CHALLENGE);
      
      expect(hmac1).not.toBe(hmac2);
    });

    it('should compute HMAC even for empty challenge (valid behavior)', async () => {
      const userId = await deriveUserId(VALID_SECRET);
      const hmac = await computeHmac(userId, '');
      
      // HMAC-SHA256 can sign empty data, this is valid
      expect(hmac).toBeDefined();
      expect(hmac).toHaveLength(64);
    });
  });

  describe('isValidUserId', () => {
    it('should validate correct user_id', () => {
      const validUserId = 'a'.repeat(64);
      expect(isValidUserId(validUserId)).toBe(true);
    });

    it('should reject user_id with wrong length', () => {
      expect(isValidUserId('a'.repeat(63))).toBe(false);
      expect(isValidUserId('a'.repeat(65))).toBe(false);
    });

    it('should reject user_id with invalid characters', () => {
      const invalidUserId = 'g'.repeat(64); // 'g' is not hex
      expect(isValidUserId(invalidUserId)).toBe(false);
    });

    it('should reject non-string inputs', () => {
      expect(isValidUserId(null)).toBe(false);
      expect(isValidUserId(undefined)).toBe(false);
      expect(isValidUserId(123)).toBe(false);
    });
  });

  describe('generateChallenge', () => {
    it('should generate challenge of correct length', () => {
      const challenge = generateChallenge(32);
      expect(challenge).toHaveLength(64); // 32 bytes = 64 hex chars
    });

    it('should generate different challenges each time', () => {
      const challenge1 = generateChallenge(32);
      const challenge2 = generateChallenge(32);
      expect(challenge1).not.toBe(challenge2);
    });

    it('should generate hexadecimal string', () => {
      const challenge = generateChallenge(32);
      expect(/^[0-9a-f]{64}$/i.test(challenge)).toBe(true);
    });

    it('should accept custom length', () => {
      const challenge = generateChallenge(16);
      expect(challenge).toHaveLength(32); // 16 bytes = 32 hex chars
    });
  });
});