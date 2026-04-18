/**
 * API Key Encryption Utility
 * 
 * Encrypts and decrypts API keys before storing in Firestore
 * 
 * Usage:
 *   const { encryptApiKey, decryptApiKey } = require('./utils/apiKeyEncryption');
 *   
 *   // Encrypt before storing
 *   const encrypted = encryptApiKey('my-api-key');
 *   await firestore.collection('users').doc(userId).update({
 *     'integrationSettings.apiKey': JSON.stringify(encrypted)
 *   });
 *   
 *   // Decrypt when reading
 *   const userDoc = await firestore.collection('users').doc(userId).get();
 *   const encryptedData = JSON.parse(userDoc.data().integrationSettings.apiKey);
 *   const apiKey = decryptApiKey(encryptedData);
 */

const crypto = require('crypto');

// Encryption key - MUST be set as environment variable in production!
// Generate a key: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
const ENCRYPTION_KEY = process.env.API_KEY_ENCRYPTION_KEY || 
                       crypto.randomBytes(32).toString('hex');
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

/**
 * Encrypt an API key
 * @param {string} apiKey - The API key to encrypt
 * @returns {Object} - Encrypted data object with encrypted, iv, and authTag
 */
function encryptApiKey(apiKey) {
    if (!apiKey || typeof apiKey !== 'string') {
        throw new Error('API key must be a non-empty string');
    }
    
    try {
        const key = Buffer.from(ENCRYPTION_KEY, 'hex');
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
        
        let encrypted = cipher.update(apiKey, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        const authTag = cipher.getAuthTag();
        
        return {
            encrypted: encrypted,
            iv: iv.toString('hex'),
            authTag: authTag.toString('hex')
        };
    } catch (error) {
        throw new Error(`Encryption failed: ${error.message}`);
    }
}

/**
 * Decrypt an API key
 * @param {Object} encryptedData - Object with encrypted, iv, and authTag
 * @returns {string} - Decrypted API key
 */
function decryptApiKey(encryptedData) {
    if (!encryptedData || typeof encryptedData !== 'object') {
        throw new Error('Encrypted data must be an object');
    }
    
    if (!encryptedData.encrypted || !encryptedData.iv || !encryptedData.authTag) {
        throw new Error('Encrypted data must contain encrypted, iv, and authTag');
    }
    
    try {
        const key = Buffer.from(ENCRYPTION_KEY, 'hex');
        const iv = Buffer.from(encryptedData.iv, 'hex');
        const authTag = Buffer.from(encryptedData.authTag, 'hex');
        
        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        decipher.setAuthTag(authTag);
        
        let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    } catch (error) {
        throw new Error(`Decryption failed: ${error.message}`);
    }
}

/**
 * Hash an API key (one-way, for verification only)
 * @param {string} apiKey - The API key to hash
 * @returns {string} - SHA-256 hash of the API key
 */
function hashApiKey(apiKey) {
    if (!apiKey || typeof apiKey !== 'string') {
        throw new Error('API key must be a non-empty string');
    }
    
    return crypto.createHash('sha256').update(apiKey).digest('hex');
}

/**
 * Verify an API key against a stored hash
 * @param {string} apiKey - The API key to verify
 * @param {string} storedHash - The stored hash to compare against
 * @returns {boolean} - True if API key matches hash
 */
function verifyApiKey(apiKey, storedHash) {
    return hashApiKey(apiKey) === storedHash;
}

module.exports = {
    encryptApiKey,
    decryptApiKey,
    hashApiKey,
    verifyApiKey
};
