# CryptoLogin Client SDK

[![npm version](https://img.shields.io/npm/v/cryptologin-client.svg)](https://www.npmjs.com/package/cryptologin-client)
[![License](https://img.shields.io/badge/License-Apache%202.0-green.svg)](LICENSE)
[![Bundle Size](https://img.shields.io/bundlephobia/min/cryptologin-client)](https://bundlephobia.com/package/cryptologin-client)

Client-side JavaScript SDK for [CryptoLogin](https://github.com/erabytse/CryptoLogin) - Zero-Knowledge-Inspired Passwordless Authentication.

<div align="center">

## The time is now ripe for it

**Stop storing password hashes. With CryptoLogin, the server only stores encrypted challenges. The master secret is used once at registration, then forgotten. At login, no secret ever crosses the network.**

<img src="https://raw.githubusercontent.com/erabytse/CryptoLogin/main/images/CryptoLogin.gif" width="320" height="170" alt="CryptoLogin"/>

CryptoLogin uses a challenge-response mechanism inspired by Zero-Knowledge principles.
The server never stores your secret. Your secret never leaves your device.

</div>

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

### 🚀 Quick Start

```javascript
import { createClient } from "cryptologin-client";

// Initialize the client
const client = createClient({
  baseURL: "https://api.docudeeper.com/api/v1",
});

// Register a new user
const userId = await client.register(masterSecret, {
  name: "John Doe",
  email: "john@example.com",
});

// Login
const session = await client.login(masterSecret);
console.log("Authenticated!", session.sessionId);

// Logout
await client.logout();
```

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
  baseURL: "https://api.docudeeper.com/api/v1",
  timeout: 5000,
  onError: (error) => console.error(error),
});
```

> **client.register(masterSecret, userData)**
>
> > Registers a new user.

```javascript
const userId = await client.register("my-secret-32-chars", {
  name: "Jane Doe",
});
```

> **client.login(masterSecret)**
>
> > Logs in a user.

```javascript
const session = await client.login("my-secret-32-chars");
// { sessionId, userId, expiresAt, authenticated }
```

> **client.logout()**
>
> > Logs out the current user.

```javascript
await client.logout();
```

> **deriveUserId(masterSecret)**
>
> > Derives a user_id from the master secret.

```javascript
import { deriveUserId } from "cryptologin-client";
const userId = await deriveUserId("my-secret-32-chars");
```

---

### Browser Usage (CDN)

```html
<script src="https://cdn.jsdelivr.net/npm/cryptologin-client/dist/cryptologin-client.min.js"></script>
<script>
  const client = CryptoLoginClient.createClient({
    baseURL: "https://api.docudeeper.com/api/v1",
  });
</script>
```

---

### Development

```bash
# Install dependencies
npm install

# Build the library
npm run build

# Run tests
npm test

# Watch for changes
npm run dev
```

## License

    Apache 2.0

## Author

    erabytse

## Links

. [CryptoLogin GitHub](https://github.com/erabytse/CryptoLogin)

. [Live Demo](https://erabytse.github.io/cryptologin-website/)

. [PyPI Package](https://pypi.org/project/cryptologin/)
