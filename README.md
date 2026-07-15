# CryptoLogin Client SDK

[![npm version](https://img.shields.io/npm/v/cryptologin-client.svg)](https://www.npmjs.com/package/cryptologin-client)
[![Tests](https://github.com/erabytse/cryptologin-client/actions/workflows/test.yml/badge.svg)](https://github.com/erabytse/cryptologin-client/actions/workflows/test.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Bundle Size](https://img.shields.io/bundlephobia/min/cryptologin-client)](https://bundlephobia.com/package/cryptologin-client)
[![npm downloads](https://img.shields.io/npm/dm/cryptologin-client.svg)](https://www.npmjs.com/package/cryptologin-client)



**Zero-Storage Authentication Client SDK** - The server knows absolutely nothing about your users.

Client-side JavaScript SDK for [CryptoLogin](https://github.com/erabytse/CryptoLogin) - Zero-Knowledge-Inspired Passwordless Authentication.

<div align="center">

## The time is now ripe for it

**Stop storing password hashes. With CryptoLogin, the server only stores encrypted challenges. The master secret is used once at registration, then forgotten. At login, no secret ever crosses the network.**

<img src="https://github.com/user-attachments/assets/68e82af9-d4bf-4d77-863a-b2fd38fdf390" width="320" height="170" alt="CryptoLogin"/>

CryptoLogin uses a challenge-response mechanism inspired by Zero-Knowledge principles.
The server never stores your secret. Your secret never leaves your device.

</div>

### 🚀 Quick Start

´´´bash
npm install cryptologin-client

```javascript
import { createClient, deriveUserId } from "cryptologin-client";

// Initialize
const client = createClient({
  baseURL: "https://your-api.com/api/v1",
});

// Register
const userId = await deriveUserId("your-master-secret-min-32-chars.");
await client.register(userId);

// Login
const session = await client.login(userId, "your-master-secret-min-32-chars.");
console.log("Authenticated:", session.authenticated);
```

## 🔒 Security Model

| Feature                | Traditional Auth    | CryptoLogin          |
| ---------------------- | ------------------- | -------------------- |
| Password storage       | Hashed on server    | Never stored         |
| Database breach impact | Credentials exposed | Nothing to steal     |
| "Forgot Password"      | Email reset         | Impossible by design |
| User sovereignty       | Low                 | Absolute             |

CryptoLogin uses a **Zero-Storage Authentication** model:

1. **Client-side derivation**: The `user_id` is derived from `master_secret` using PBKDF2-SHA512 (100,000 iterations)
2. **Challenge-Response**: Server generates encrypted challenges using AES-256-GCM
3. **Local decryption**: Client decrypts challenges locally - `master_secret` NEVER leaves the browser
4. **No server secrets**: Server stores only encrypted tokens, not passwords or secrets

### Cryptographic Standards

- **Key Derivation**: PBKDF2-SHA512 (100,000 iterations)
- **Encryption**: AES-256-GCM
- **Hashing**: SHA-256

## ⚠️ Important Trade-offs

**CryptoLogin is NOT for everyone:**

- ❌ No "Forgot Password" flow (server knows nothing)
- ❌ If user loses `master_secret`, account is permanently locked
- ✅ Absolute data sovereignty
- ✅ Zero server-side secrets to steal
- ✅ Immune to database breaches

**This is a deliberate design choice, not a bug.**

## Features

- 🔐 **Passwordless Authentication** - No email, no password required
- 🛡️ **Zero-Knowledge-Inspired** - Your secret never leaves your browser
- ⚡ **Web Crypto API** - Uses native browser cryptography
- 📦 **Lightweight** - ~3KB minified
- 🔧 **TypeScript Support** - Full type definitions included
- 🌐 **Universal** - Works in browsers and Node.js

## Installation

```bash
npm install cryptologin-client
# or
yarn add cryptologin-client
# or
pnpm add cryptologin-client
```

---

📖 API Documentation

**API Reference**

| Option  | Type     | Default  | Description              |
| ------- | -------- | -------- | ------------------------ |
| baseURL | string   | Required | Your CryptoLogin API URL |
| timeout | number   | 10000    | Timeout in milliseconds  |
| onError | function | null     | Error callback           |

---

> **createClient(options)**
>
> > Creates a new CryptoLogin client.

```javascript
const client = createClient({
  baseURL: "https://api.example.com/v1", // Required
  timeout: 30000, // Optional, default: 30000ms
});
```

> **deriveUserId(masterSecret)**
>
> > Derives a unique user ID from the master secret. Minimum 32 characters required.

```javascript
const userId = await deriveUserId("my-super-secret-passphrase-1234567890");
// Returns: 64-character hex string
```

> **client.register(userId)**
>
> > Registers a new user with the server.

```javascript
const result = await client.register(userId);
// Returns: { success: true, userId: '...' }
});
```

> **client.login(userId, masterSecret)**
>
> > Authenticates the user using challenge-response.

```javascript
const session = await client.login(userId, masterSecret);
// Returns: { authenticated: true, sessionId: '...' }
```

> **client.logout()**
>
> > Logs out the current user.

```javascript
await client.logout();
```

**Session Management**

```javascript
import { saveSession, loadSession, clearSession } from "cryptologin-client";

// Save session after login
saveSession(session);

// Load existing session
const session = loadSession();

// Clear session (logout)
clearSession();
```

---

🧪 **Development & Testing**

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Watch mode
npm test -- --watch
```

📦 **Publishing**

```bash
npm version patch  # or minor/major
npm publish
```

---

**🤝 Contributing**

Contributions are welcome! Please read our Contributing Guide for details.

---

## 📄 License

MIT © [erabytse](https://github.com/erabytse)

---

## Author

[**erabytse**](https://github.com/erabytse)

---

## 🔗 Links

. [Server SDK (Python): cryptologin on PyPI](https://pypi.org/project/cryptologin/)

. [CryptoLogin GitHub](https://github.com/erabytse/CryptoLogin)

. [Live Demo](https://erabytse.github.io/cryptologin-website/)

. [Website: cryptologin-website](https://erabytse.github.io/cryptologin-website/)

. [PyPI Package](https://pypi.org/project/cryptologin/)

---

<div align="center">
Built with ❤️ by <b>erabytse</b>

Reinventing Authentication. One Secret at a Time.

A quiet rebellion against digital waste.

</div>
