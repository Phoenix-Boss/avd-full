const crypto = require('crypto');

const ALGORITHM = 'aes-256-cbc';
const SECRET_KEY = crypto.randomBytes(32); // Replace with a securely stored key
const IV_LENGTH = 16; // Initialization vector length

/**
 * Encrypts a given text.
 * @param {string} text - The plain text to encrypt.
 * @returns {string} The encrypted text in base64 format.
 */
const encrypt = (text) => {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, iv);
    let encrypted = cipher.update(text, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return `${iv.toString('base64')}:${encrypted}`;
};

/**
 * Decrypts a given encrypted text.
 * @param {string} encryptedText - The encrypted text in base64 format.
 * @returns {string} The decrypted plain text.
 */
const decrypt = (encryptedText) => {
    const [iv, encrypted] = encryptedText.split(':');
    const decipher = crypto.createDecipheriv(ALGORITHM, SECRET_KEY, Buffer.from(iv, 'base64'));
    let decrypted = decipher.update(encrypted, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
};

module.exports = { encrypt, decrypt };