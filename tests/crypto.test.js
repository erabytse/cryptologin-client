// Implement JS logic for crypto.test.js
/**
 * Tests pour les opérations cryptographiques
 */

import { deriveUserId, isValidUserId, generateChallenge } from '../src/core/crypto.js';

describe('Crypto Functions', () => {
    const masterSecret = 'MySuperSecureMasterSecret1234567890!@#$';

    test('deriveUserId should return a 64-character hex string', async () => {
        const userId = await deriveUserId(masterSecret);
        expect(userId).toHaveLength(64);
        expect(userId).toMatch(/^[0-9a-f]{64}$/);
    });

    test('deriveUserId should be deterministic', async () => {
        const id1 = await deriveUserId(masterSecret);
        const id2 = await deriveUserId(masterSecret);
        expect(id1).toBe(id2);
    });

    test('deriveUserId should fail with short secret', async () => {
        await expect(deriveUserId('short')).rejects.toThrow('at least 32 characters');
    });

    test('isValidUserId should validate correctly', () => {
        const valid = 'a'.repeat(64);
        const invalid = 'abc';
        expect(isValidUserId(valid)).toBe(true);
        expect(isValidUserId(invalid)).toBe(false);
        expect(isValidUserId('')).toBe(false);
    });

    test('generateChallenge should return a hex string', () => {
        const challenge = generateChallenge(16);
        expect(challenge).toHaveLength(32);
        expect(challenge).toMatch(/^[0-9a-f]+$/);
    });
});
