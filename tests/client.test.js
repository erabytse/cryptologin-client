// Implement JS logic for client.test.js
/**
 * Tests for the CryptoLogin client
 */

import { CryptoLoginClient, createClient } from '../src/core/client.js';

// Global fetch mock
global.fetch = jest.fn();

describe('CryptoLoginClient', () => {
    const baseURL = 'https://api.example.com/api/v1';
    let client;

    beforeEach(() => {
        client = new CryptoLoginClient({ baseURL });
        fetch.mockClear();
    });

    test('constructor should throw without baseURL', () => {
        expect(() => new CryptoLoginClient()).toThrow('baseURL is required');
    });

    test('createClient should return a CryptoLoginClient instance', () => {
        const instance = createClient({ baseURL });
        expect(instance).toBeInstanceOf(CryptoLoginClient);
    });

    test('register should call the correct endpoint', async () => {
        const mockResponse = {
            success: true,
            data: { user_id: 'a'.repeat(64) }
        };
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockResponse
        });

        const userId = await client.register('test-secret-32-characters-long');
        expect(fetch).toHaveBeenCalledWith(
            `${baseURL}/auth/register_v2`,
            expect.objectContaining({
                method: 'POST',
                body: expect.any(String)
            })
        );
        expect(userId).toBe(mockResponse.data.user_id);
    });

    test('login should call the correct endpoints', async () => {
        const mockInitResponse = {
            challenge: 'encrypted_challenge'
        };
        const mockVerifyResponse = {
            authenticated: true,
            session_id: 'a'.repeat(64),
            user_id: 'a'.repeat(64),
            expires_at: '2026-12-31T23:59:59Z'
        };

        fetch
            .mockResolvedValueOnce({
                ok: true,
                json: async () => mockInitResponse
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => mockVerifyResponse
            });

        const session = await client.login('test-secret-32-characters-long');
        expect(fetch).toHaveBeenCalledTimes(2);
        expect(session.sessionId).toBe(mockVerifyResponse.session_id);
        expect(client.isAuthenticated).toBe(true);
    });

    test('logout should clear session', async () => {
        // Simulate an active session
        client._sessionId = 'a'.repeat(64);
        client._expiresAt = new Date(Date.now() + 3600000);

        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ message: 'Logged out' })
        });

        await client.logout();
        expect(client.isAuthenticated).toBe(false);
        expect(client._sessionId).toBe(null);
    });
});
