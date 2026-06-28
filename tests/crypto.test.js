import { describe, it, expect } from 'vitest';
import { deriveUserId, decryptChallenge } from '../src/core/crypto.js';

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

  describe('decryptChallenge', () => {
    const VALID_SECRET = 'test-secret-for-decryption-1234567890'; // 40 chars

    it('should decrypt a valid challenge', async () => {
      const plaintext = 'challenge-nonce-12345';
      const encryptedChallenge = await encryptForTest(plaintext, VALID_SECRET);
      
      const decrypted = await decryptChallenge(encryptedChallenge, VALID_SECRET);
      expect(decrypted).toBe(plaintext);
    });

    it('should throw error for wrong master_secret', async () => {
      const wrongSecret = 'wrong-secret-for-decryption-0987654321'; // 40 chars
      const plaintext = 'challenge-nonce-12345';
      
      const encryptedChallenge = await encryptForTest(plaintext, VALID_SECRET);
      
      await expect(
        decryptChallenge(encryptedChallenge, wrongSecret)
      ).rejects.toThrow();
    });
  });
});

// Helper function for tests (simulate server-side encryption)
async function encryptForTest(plaintext, masterSecret) {
  const encoder = new TextEncoder();
  const secretData = encoder.encode(masterSecret);
  const salt = encoder.encode('cryptologin-v2-salt');
  
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
      salt: salt,
      iterations: 100000,
      hash: 'SHA-512'
    },
    key,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );
  
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    derivedKey,
    encoder.encode(plaintext)
  );
  
  // Combine IV + ciphertext
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encrypted), iv.length);
  
  return btoa(String.fromCharCode(...combined));
}