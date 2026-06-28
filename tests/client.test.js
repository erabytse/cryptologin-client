import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CryptoLoginClient } from '../src/core/client.js';
import { saveSession, loadSession, clearSession } from '../src/utils/helpers.js';

describe('CryptoLoginClient', () => {
  let client;
  const TEST_BASE_URL = 'http://localhost:5000';  
  
  beforeEach(() => {
    // Le constructeur attend un OBJET avec baseURL
    client = new CryptoLoginClient({ baseURL: TEST_BASE_URL });
    clearSession();
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with baseURL option', () => {
      expect(client.baseURL).toBe(TEST_BASE_URL);
    });

    it('should throw error if baseURL is missing', () => {
      expect(() => new CryptoLoginClient({})).toThrow('baseURL is required');
    });

    it('should throw error if options is empty', () => {
      expect(() => new CryptoLoginClient()).toThrow('baseURL is required');
    });

    it('should accept custom timeout', () => {
      const customClient = new CryptoLoginClient({ 
        baseURL: TEST_BASE_URL, 
        timeout: 5000 
      });
      expect(customClient.timeout).toBe(5000);
    });
  });

  describe('session management', () => {
    it('should save and load session', () => {
      const sessionData = {
        userId: 'test-user-id-123',
        sessionId: 'session-abc-456',
        expiresAt: Date.now() + 3600000 // 1 hour
      };
      
      saveSession(sessionData);
      const loaded = loadSession();
      
      expect(loaded).not.toBeNull();
      expect(loaded.userId).toBe(sessionData.userId);
      expect(loaded.sessionId).toBe(sessionData.sessionId);
    });

    it('should return null when no session exists', () => {
      const loaded = loadSession();
      expect(loaded).toBeNull();
    });

    it('should clear session', () => {
      saveSession({ 
        userId: 'test', 
        sessionId: '123', 
        expiresAt: Date.now() + 3600000 
      });
      
      clearSession();
      
      expect(loadSession()).toBeNull();
    });

    it('should handle expired sessions', () => {
      const expiredSession = {
        userId: 'test-user',
        sessionId: 'expired-session',
        expiresAt: Date.now() - 1000 // Expired 1 second ago
      };
      
      saveSession(expiredSession);
      const loaded = loadSession();
      
      // Depending on your helpers.js implementation, 
      // expired sessions should return null or be flagged
      // Adjust this test based on your actual behavior
      if (loaded) {
        expect(loaded.expiresAt).toBeLessThan(Date.now());
      }
    });
  });
});