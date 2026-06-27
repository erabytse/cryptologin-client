// Implement JS logic for example.js

/**
 * CryptoLogin Client SDK - Exemple Node.js
 */

import { createClient, deriveUserId } from 'cryptologin-client';

// Configuration du client
const client = createClient({
    baseURL: 'https://api.docudeeper.com/api/v1'
});

const MASTER_SECRET = 'mon-super-secret-de-32-caracteres-minimum';

async function main() {
    console.log('🔐 CryptoLogin Client SDK - Exemple Node.js');
    console.log('============================================\n');

    try {
        // 1. Dériver un user_id (côté client)
        console.log('1️⃣ Dérivation du user_id...');
        const userId = await deriveUserId(MASTER_SECRET);
        console.log(`   user_id: ${userId}\n`);

        // 2. Enregistrement
        console.log('2️⃣ Enregistrement...');
        const registeredUserId = await client.register(MASTER_SECRET, {
            name: 'Exemple Node.js',
            source: 'cryptologin-demo-node'
        });
        console.log(`   ✅ Utilisateur enregistré : ${registeredUserId}\n`);

        // 3. Login
        console.log('3️⃣ Connexion...');
        const session = await client.login(MASTER_SECRET);
        console.log('   ✅ Connexion réussie !');
        console.log(`   Session ID : ${session.sessionId}`);
        console.log(`   Expire le  : ${session.expiresAt}\n`);

        // 4. Vérification de la session
        console.log('4️⃣ État de la session...');
        console.log(`   Authentifié : ${client.isAuthenticated}`);
        console.log(`   Session ID  : ${client.sessionId}\n`);

        // 5. Déconnexion
        console.log('5️⃣ Déconnexion...');
        await client.logout();
        console.log('   ✅ Déconnecté.');
        console.log(`   Authentifié : ${client.isAuthenticated}`);

    } catch (error) {
        console.error('❌ Erreur :', error.message);
        if (error.status) console.error(`   Status : ${error.status}`);
    }
}

main();
