/**
 * Basic usage example for CryptoLogin Client SDK
 */
import { createClient, deriveUserId, saveSession, loadSession } from '../src/index.js';

// 1. Initialize the client
const client = createClient({
  baseUrl: 'http://localhost:5000',
  timeout: 30000
});

// 2. Registration flow
async function register(masterSecret) {
  console.log('🔐 Deriving user_id...');
  const userId = await deriveUserId(masterSecret);
  console.log('✅ User ID:', userId.substring(0, 16) + '...');

  console.log('📡 Registering with server...');
  const result = await client.register(userId);
  console.log('✅ Registered:', result);
  
  return userId;
}

// 3. Login flow
async function login(masterSecret) {
  console.log('🔐 Deriving user_id...');
  const userId = await deriveUserId(masterSecret);

  console.log('📡 Initiating login...');
  const result = await client.login(userId, masterSecret);
  
  if (result.authenticated) {
    console.log('✅ Login successful!');
    console.log('🎫 Session ID:', result.sessionId);
    
    // Save session for later use
    saveSession({
      userId: userId,
      sessionId: result.sessionId,
      expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    });
  }
  
  return result;
}

// 4. Check existing session
function checkSession() {
  const session = loadSession();
  if (session) {
    console.log('✅ Active session found');
    console.log('User ID:', session.userId);
    console.log('Expires:', new Date(session.expiresAt).toISOString());
  } else {
    console.log('❌ No active session');
  }
  return session;
}

// Example usage
async function main() {
  const masterSecret = 'my-super-secret-passphrase';
  
  try {
    // Register new user
    await register(masterSecret);
    
    // Login
    await login(masterSecret);
    
    // Check session
    checkSession();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Code:', error.code);
  }
}

main();