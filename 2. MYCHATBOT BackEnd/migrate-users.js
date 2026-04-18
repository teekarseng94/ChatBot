/**
 * Migration script to add integrationSettings to existing user documents
 * 
 * Usage:
 *   node migrate-users.js
 * 
 * Requirements:
 *   - firebase-admin installed: npm install firebase-admin
 *   - serviceAccountKey.json in project root
 */

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Check if service account key exists
const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');

if (!fs.existsSync(serviceAccountPath)) {
    console.error('❌ Error: serviceAccountKey.json not found!');
    console.error('   Please download it from Firebase Console:');
    console.error('   Project Settings → Service Accounts → Generate New Private Key');
    process.exit(1);
}

// Initialize Firebase Admin
try {
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: 'chatbot20-21e3a'
    });
    console.log('✅ Firebase Admin initialized');
} catch (error) {
    console.error('❌ Error initializing Firebase Admin:', error.message);
    process.exit(1);
}

const db = admin.firestore();

async function migrateUsers() {
    console.log('\n🔄 Starting user migration...\n');
    
    try {
        const usersRef = db.collection('users');
        const snapshot = await usersRef.get();
        
        if (snapshot.empty) {
            console.log('ℹ️ No users found in Firestore');
            return;
        }
        
        console.log(`📊 Found ${snapshot.size} user document(s)\n`);
        
        const batch = db.batch();
        let count = 0;
        let skipped = 0;
        
        snapshot.forEach((doc) => {
            const data = doc.data();
            
            // Only add integrationSettings if it doesn't exist
            if (!data.integrationSettings) {
                batch.update(doc.ref, {
                    integrationSettings: {
                        webhookUrl: '',
                        apiKey: '',
                        isEnabled: false
                    }
                });
                console.log(`  ✅ Will update: ${doc.id}`);
                count++;
            } else {
                console.log(`  ⏭️  Skipped (already has integrationSettings): ${doc.id}`);
                skipped++;
            }
        });
        
        if (count > 0) {
            console.log(`\n💾 Committing ${count} update(s)...`);
            await batch.commit();
            console.log(`\n✅ Successfully updated ${count} user document(s) with integrationSettings`);
        } else {
            console.log(`\nℹ️ All users already have integrationSettings`);
        }
        
        if (skipped > 0) {
            console.log(`ℹ️ Skipped ${skipped} user(s) (already have integrationSettings)`);
        }
        
        console.log('\n✅ Migration complete!');
        
    } catch (error) {
        console.error('\n❌ Migration failed:', error);
        throw error;
    }
}

// Run migration
migrateUsers()
    .then(() => {
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Fatal error:', error);
        process.exit(1);
    });
